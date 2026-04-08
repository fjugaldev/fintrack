-- =============================================================
-- FinTrack — Cron automático de transacciones recurrentes
-- =============================================================
-- Ejecutar este script UNA VEZ en el SQL Editor de Supabase
-- (Database → SQL Editor → New query → pegar y ejecutar)
--
-- Requisito: la extensión pg_cron debe estar habilitada.
-- En Supabase está activa por defecto en todos los planes (incluyendo Free).
-- Para verificar: SELECT * FROM pg_extension WHERE extname = 'pg_cron';
-- =============================================================


-- =============================================================
-- FUNCIÓN: apply_due_recurring_transactions()
-- Procesa todas las transacciones recurrentes vencidas de todos
-- los usuarios en un solo batch. Retorna el número de registros
-- aplicados.
-- =============================================================
CREATE OR REPLACE FUNCTION apply_due_recurring_transactions()
RETURNS integer AS $$
DECLARE
  applied_count integer := 0;
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT * FROM recurring_transactions
    WHERE next_due_date <= CURRENT_DATE
      AND is_active = true
      AND (last_applied_date IS NULL OR last_applied_date < CURRENT_DATE)
    FOR UPDATE SKIP LOCKED  -- evita race condition si se ejecuta dos veces en paralelo
  LOOP
    -- 1. Crear la transacción real
    INSERT INTO transactions (profile_id, account_id, category_id, amount, type, description, date)
    VALUES (
      rec.profile_id,
      rec.account_id,
      rec.category_id,
      rec.amount,
      rec.type,
      rec.description,
      rec.next_due_date  -- fecha programada, no la fecha de procesamiento
    );

    -- 2. Actualizar balance de la cuenta
    UPDATE financial_accounts
    SET
      balance    = balance + CASE rec.type
                    WHEN 'income'  THEN  rec.amount::numeric
                    WHEN 'expense' THEN -rec.amount::numeric
                  END,
      updated_at = NOW()
    WHERE id = rec.account_id;

    -- 3. Avanzar next_due_date y marcar last_applied_date (idempotencia)
    UPDATE recurring_transactions
    SET
      last_applied_date = CURRENT_DATE,
      next_due_date     = CASE rec.frequency
        WHEN 'daily'   THEN rec.next_due_date + INTERVAL '1 day'
        WHEN 'weekly'  THEN rec.next_due_date + INTERVAL '7 days'
        WHEN 'monthly' THEN rec.next_due_date + INTERVAL '1 month'
        WHEN 'yearly'  THEN rec.next_due_date + INTERVAL '1 year'
      END,
      updated_at        = NOW()
    WHERE id = rec.id;

    applied_count := applied_count + 1;
  END LOOP;

  RETURN applied_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================
-- REGISTRO EN pg_cron
-- Ejecutar todos los días a las 00:05 UTC.
--
-- Para evitar duplicados si ya existe el job, primero se elimina.
-- El bloque DO captura el error si el job no existe aún (primera ejecución).
-- =============================================================
DO $$
BEGIN
  PERFORM cron.unschedule('apply-recurring-transactions');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'apply-recurring-transactions',            -- nombre único del job
  '5 0 * * *',                               -- todos los días a las 00:05 UTC
  'SELECT apply_due_recurring_transactions()'
);


-- =============================================================
-- CONSULTAS DE OPERACIONES (para referencia)
-- =============================================================

-- Ver todos los jobs registrados:
-- SELECT * FROM cron.job;

-- Ver historial de ejecuciones (últimas 20):
-- SELECT jobid, status, return_message, start_time, end_time
-- FROM cron.job_run_details
-- ORDER BY start_time DESC
-- LIMIT 20;

-- Ejecutar manualmente (para probar):
-- SELECT apply_due_recurring_transactions();

-- Cancelar el job (si se necesita desactivar):
-- SELECT cron.unschedule('apply-recurring-transactions');
