import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// El DATABASE_URL apunta al pooler de Supabase (puerto 6543, transaction mode).
// En transaction mode no se soportan prepared statements, por eso prepare: false.
const client = postgres(process.env.DATABASE_URL!, { prepare: false })

export const db = drizzle(client, { schema })
