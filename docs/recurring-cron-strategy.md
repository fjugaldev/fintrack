# Estrategia de ejecución automática — Transacciones recurrentes

## Contexto

Las transacciones recurrentes necesitan ejecutarse automáticamente en el periodo configurado
(diario, semanal, mensual, anual). Hay dos opciones principales para implementarlo.

---

## Opción A: pg_cron + Supabase Edge Function (nativo Supabase)

### Cómo funciona

```
pg_cron (ej. "5 0 * * *" → todos los días a las 00:05 UTC)
  → invoca Supabase Edge Function /apply-recurring
    → Edge Function ejecuta SQL directamente en la DB:
        1. INSERT INTO transactions (...) SELECT ... FROM recurring_transactions WHERE next_due_date <= CURRENT_DATE
        2. UPDATE financial_accounts SET balance = balance ± amount (batch)
        3. UPDATE recurring_transactions SET next_due_date = next_due_date + INTERVAL (batch)
```

### Procesamiento masivo en SQL (todos los usuarios a la vez)

```sql
-- 1. Crear transacciones para todos los usuarios
INSERT INTO transactions (profile_id, account_id, category_id, amount, type, description, date)
SELECT profile_id, account_id, category_id, amount, type, description, CURRENT_DATE
FROM recurring_transactions
WHERE next_due_date <= CURRENT_DATE
  AND is_active = true;

-- 2. Actualizar balances en batch
UPDATE financial_accounts fa
SET balance = balance + CASE r.type WHEN 'income' THEN r.amount ELSE -r.amount END
FROM recurring_transactions r
WHERE r.account_id = fa.id
  AND r.next_due_date <= CURRENT_DATE
  AND r.is_active = true;

-- 3. Avanzar next_due_date según frecuencia
UPDATE recurring_transactions
SET next_due_date = CASE frequency
  WHEN 'daily'   THEN next_due_date + INTERVAL '1 day'
  WHEN 'weekly'  THEN next_due_date + INTERVAL '7 days'
  WHEN 'monthly' THEN next_due_date + INTERVAL '1 month'
  WHEN 'yearly'  THEN next_due_date + INTERVAL '1 year'
END
WHERE next_due_date <= CURRENT_DATE
  AND is_active = true;
```

### Ventajas

- Corre **dentro de la DB** — sin latencia de red entre cron → DB
- **Un solo job** procesa todos los perfiles/usuarios en paralelo (SQL masivo)
- Supabase Free incluye pg_cron sin costo adicional
- Edge Functions: 500k invocaciones/mes gratis, luego $2 por millón
- **10 usuarios o 100,000 usuarios = mismo costo, misma duración** — escala horizontalmente sin cambios

### Desventajas

- Si el job falla a medias, es más difícil saber qué profiles ya se procesaron
- Logs de pg_cron son básicos — debugging más complejo
- La lógica de negocio queda en SQL/Edge Function, separada del código Next.js (duplicación)

---

## Opción B: Vercel Cron + Next.js API Route

### Cómo funciona

```
Vercel Cron (ej. "5 0 * * *")
  → GET /api/cron/apply-recurring  (protegida por CRON_SECRET en header)
    → API Route itera sobre todos los usuarios con recurrentes vencidas
    → Reutiliza las server actions / Drizzle ORM existentes
    → Procesa profile por profile en un loop
```

### Ejemplo de implementación

```ts
// src/app/api/cron/apply-recurring/route.ts
export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const due = await getDueRecurringTransactionsAllUsers()  // sin filtro de usuario
  for (const rec of due) {
    await applyRecurringTransaction(rec.id)
  }
  return Response.json({ applied: due.length })
}
```

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/apply-recurring",
    "schedule": "5 0 * * *"
  }]
}
```

### Ventajas

- Reutiliza el código existente (server actions, Drizzle ORM) — sin duplicación
- Logs en Vercel Dashboard — observabilidad mucho mejor
- Fácil de testear localmente con `curl -H "Authorization: Bearer <secret>" /api/cron/...`

### Desventajas críticas a escala

- **Vercel Free**: 1 cron job únicamente, frecuencia mínima diaria
- **Vercel Pro ($20/mes)**: hasta 40 crons, frecuencia hasta cada minuto
- Con 10,000+ usuarios iterando uno por uno → riesgo de **timeout**
  (límite: 60s en Hobby, 300s en Pro)
- Costo crece con el número de usuarios (duración de función × invocaciones)

---

## Comparativa

| Criterio                  | pg_cron + Edge Fn        | Vercel Cron + API Route  |
|---------------------------|--------------------------|--------------------------|
| **Costo a escala**        | ✅ Casi gratis (SQL batch)| ❌ Crece con usuarios     |
| **Volumen de usuarios**   | ✅ Sin degradación        | ❌ Loop N usuarios → timeout |
| **Observabilidad / logs** | ⚠️ Básica                | ✅ Excelente (Vercel)     |
| **Mantenimiento código**  | ⚠️ Lógica duplicada en SQL| ✅ Reutiliza server actions |
| **Costo en Free tier**    | ✅ $0                    | ✅ $0 (1 job/día)         |
| **Complejidad setup**     | ⚠️ Media                 | ✅ Baja                   |
| **Ideal para**            | SaaS con volumen         | MVP / primeros usuarios   |

---

## Recomendación por etapa

### MVP / primeros usuarios → Opción B (Vercel Cron)

Más rápido de implementar, observabilidad sin esfuerzo adicional, reutiliza el código existente.
El cron diario de Vercel Free es suficiente para frecuencias `monthly` y `yearly`.
Para `daily` y `weekly` es aceptable en MVP (se aplican al día siguiente a las 00:05 UTC).

### SaaS en crecimiento → Migrar a Opción A (pg_cron)

Cuando el número de usuarios justifique la migración o antes del lanzamiento comercial.
El cambio es solo en la **capa de ejecución** — la lógica de negocio y el schema no cambian.
El SQL batch de la Opción A permite procesar cualquier volumen sin costo adicional.

---

## Consideraciones de idempotencia (ambas opciones)

Para evitar duplicados si el cron se ejecuta dos veces (fallo de red, retry):

- Agregar columna `last_applied_date date` en `recurring_transactions`
- Condición extra: `AND (last_applied_date IS NULL OR last_applied_date < CURRENT_DATE)`
- Actualizar `last_applied_date = CURRENT_DATE` junto con `next_due_date`

Esto hace el job **idempotente** — ejecutarlo N veces el mismo día produce el mismo resultado.
