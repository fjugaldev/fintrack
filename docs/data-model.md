# Modelo de datos — Usuarios, Perfiles y Multi-tenant

> Documento de referencia arquitectónica para el desarrollo de FinTrack.
> Cubre la evolución del modelo desde el MVP hasta el SaaS multi-tenant.

---

## 1. Terminología (desambiguación)

Estos tres conceptos son distintos y no deben confundirse:

| Término | Tabla | Descripción |
|---|---|---|
| **Cuenta de usuario** | `auth.users` | El login. Gestionado por Supabase Auth. Contiene email, provider OAuth, etc. |
| **Perfil** | `profiles` | Extensión del usuario dentro de la app. Nombre, avatar, preferencias, plan de suscripción. |
| **Cuenta financiera** | `financial_accounts` | Un banco, tarjeta de crédito, efectivo u otro instrumento financiero del usuario. |

---

## 2. Caso 1 — MVP: tenant simple (1 usuario = 1 perfil)

En el MVP cada cuenta de usuario tiene exactamente un perfil. La relación es 1:1.

```
auth.users
└── profiles  [id = auth.users.id, relación 1:1]
    ├── financial_accounts      (profile_id FK)
    ├── categories              (profile_id FK)
    ├── transactions            (profile_id + account_id + category_id FKs)
    ├── budgets                 (profile_id + category_id FKs)
    ├── savings_goals           (profile_id + account_id FKs)
    └── recurring_transactions  (profile_id + account_id + category_id FKs)
```

**Schema mínimo de `profiles` en MVP:**

```sql
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  created_at timestamptz default now()
);
```

> En MVP `id = user_id` (misma columna, misma fila). Se mantienen ambas columnas para no necesitar migración en Fase 3.

**RLS en MVP:**

```sql
-- Ejemplo para financial_accounts
create policy "propietario" on financial_accounts
  for all using (profile_id = auth.uid());
```

`auth.uid()` devuelve el `id` del registro en `auth.users`, que en MVP coincide con el `id` de `profiles`.

---

## 3. Caso 2 — Fase 3: multi-perfil familiar (N perfiles, 1 cuenta de usuario)

Un solo login (`auth.users`) puede tener varios perfiles bajo el mismo `user_id`.
Caso de uso: una familia comparte una suscripción pero cada miembro tiene sus datos financieros separados.

```
auth.users  (1 login para toda la familia)
└── profiles  [user_id FK → auth.users.id]
    ├── profiles.id = "papa-uuid"   → sus financial_accounts, transactions, etc.
    ├── profiles.id = "mama-uuid"   → sus financial_accounts, transactions, etc.
    └── profiles.id = "hijo-uuid"   → sus financial_accounts, transactions, etc.
```

**Schema de `profiles` en Fase 3:**

```sql
create table profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  created_at timestamptz default now()
);
```

Ahora `id ≠ user_id`. El perfil activo en sesión (guardado en el cliente, por ejemplo en `localStorage` o en una cookie) determina qué datos se muestran en la UI.

**Datos compartidos entre perfiles (ej. metas familiares):**

Las tablas de datos compartidos filtran por `user_id` en lugar de `profile_id`:

```sql
-- Meta familiar visible para todos los perfiles de la familia
create policy "familia" on family_savings_goals
  for all using (
    user_id = (select user_id from profiles where id = auth.uid())
  );
```

**RLS en Fase 3:**

Las tablas de dominio individual siguen filtrando por `profile_id`, pero ahora hay que pasar el perfil activo explícitamente (por ejemplo via un claim custom en el JWT o una función de sesión).

---

## 4. Caso 3 — Fase 4: SaaS multi-tenant

Cada `auth.users` es un **tenant** aislado. El aislamiento entre tenants lo garantiza RLS usando `auth.uid()` extraído del JWT de sesión — nunca se necesita un `tenant_id` separado.

**Tabla de suscripciones:**

```sql
create table subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  plan                  text not null check (plan in ('free', 'pro', 'family')),
  polar_subscription_id text,
  status                text not null default 'active',
  current_period_end    timestamptz,
  created_at            timestamptz default now()
);
```

**Límites por plan:**

| Plan | Perfiles permitidos | Funcionalidades |
|---|---|---|
| `free` | 1 | Funcionalidades básicas del MVP |
| `pro` | 1 | OCR/AI, reportes avanzados, exportación |
| `family` | hasta 5 | Todo lo de Pro + multi-perfil familiar |

**Enforcement del límite de perfiles:**

```sql
-- Trigger o check en el INSERT de profiles
create or replace function check_profile_limit()
returns trigger as $$
declare
  v_plan text;
  v_count int;
  v_limit int;
begin
  select plan into v_plan
    from subscriptions
   where user_id = new.user_id and status = 'active';

  select count(*) into v_count
    from profiles where user_id = new.user_id;

  v_limit := case v_plan
    when 'family' then 5
    else 1
  end;

  if v_count >= v_limit then
    raise exception 'Límite de perfiles alcanzado para el plan %', v_plan;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger enforce_profile_limit
  before insert on profiles
  for each row execute function check_profile_limit();
```

---

## 5. Por qué `profile_id` en todas las tablas desde el MVP

Esta es la decisión de diseño más importante del modelo.

**El problema que se evita:**

Si en MVP se usara `user_id` directamente en todas las tablas de dominio (`financial_accounts`, `transactions`, etc.), al llegar a Fase 3 habría que:

1. Añadir `profile_id` a todas esas tablas.
2. Migrar los datos existentes para rellenar `profile_id`.
3. Actualizar todas las políticas RLS.
4. Actualizar todas las queries de la aplicación.

**La solución:**

Usar `profile_id` desde el primer día. En MVP la restricción `profile_id = auth.uid()` es equivalente a `user_id = auth.uid()` porque `profiles.id = auth.users.id`. La estructura ya está preparada para 1:N sin cambiar ninguna tabla de dominio.

```
MVP:   profiles.id  ==  auth.uid()  ==  user_id   ← todo igual, sin cambios
Fase3: profiles.id  !=  auth.uid()                ← solo cambia cómo se obtiene el profile_id activo
```

El único cambio en Fase 3 es cómo se resuelve el perfil activo en el contexto de la sesión (un custom claim en el JWT, una función RPC, o un parámetro de sesión).

---

## 6. RLS por fase — Tabla resumen

| Fase | Tabla de dominio | Política RLS |
|---|---|---|
| **MVP (Fase 1-2)** | `financial_accounts`, `transactions`, etc. | `profile_id = auth.uid()` |
| **Multi-perfil (Fase 3)** | Datos individuales | `profile_id = current_profile_id()` ¹ |
| **Multi-perfil (Fase 3)** | Datos compartidos | `user_id = (select user_id from profiles where id = current_profile_id())` |
| **SaaS (Fase 4)** | `subscriptions` | `user_id = auth.uid()` |
| **SaaS (Fase 4)** | Todo lo demás | Igual que Fase 3, el aislamiento entre tenants lo da `auth.uid()` en el JWT |

> ¹ `current_profile_id()` es una función que lee el perfil activo del contexto de sesión (implementación a definir en Fase 3 — opciones: custom JWT claim con Supabase Edge Function, `set_config` de PostgreSQL, o columna de sesión en `profiles`).

---

## 7. Diagrama de relaciones completo (Fase 3+)

```
auth.users (tenant)
│
├── subscriptions (user_id FK)
│
└── profiles (user_id FK) — uno o varios según el plan
    │
    ├── financial_accounts (profile_id FK)
    │   └── transactions (account_id FK)
    │
    ├── categories (profile_id FK)
    │   └── transactions (category_id FK)
    │       └── recurring_transactions (profile_id + account_id + category_id FKs)
    │
    ├── budgets (profile_id + category_id FKs)
    │
    └── savings_goals (profile_id + account_id FKs)
```

---

*Última actualización: 2026-03-13*
