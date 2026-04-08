import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

// ============================================================
// ENUMs
// ============================================================

export const accountTypeEnum = pgEnum('account_type', [
  'cash',
  'checking',
  'savings',
  'credit_card',
  'investment',
  'crypto_wallet',
])

export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'expense',
])

export const categoryTypeEnum = pgEnum('category_type', [
  'income',
  'expense',
])

export const budgetPeriodEnum = pgEnum('budget_period', [
  'monthly',
  'yearly',
])

export const recurringFreqEnum = pgEnum('recurring_frequency', [
  'daily',
  'weekly',
  'monthly',
  'yearly',
])

// ============================================================
// PROFILES
// ============================================================

// La tabla profiles extiende auth.users de Supabase.
// Se crea automáticamente al hacer signup via trigger (ver supabase/seed.sql).
// user_id se mantiene separado de id para soportar multi-perfil familiar en Fase 3
// (en MVP id === user_id, ambos apuntan al mismo auth.users.id).
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // mismo id que auth.users
  userId: uuid('user_id').notNull(), // FK a auth.users.id — en MVP = id; en Fase 3 permite 1:N
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  currency: text('currency').notNull().default('USD'),
  timezone: text('timezone').notNull().default('UTC'),
  locale: text('locale').notNull().default('es'),
  theme: text('theme').notNull().default('system'),
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert

// ============================================================
// FINANCIAL ACCOUNTS
// ============================================================

export const financialAccounts = pgTable(
  'financial_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: accountTypeEnum('type').notNull(),
    icon: text('icon'),
    color: text('color').notNull().default('#6366f1'),
    balance: numeric('balance', { precision: 14, scale: 2 }).notNull().default('0'),
    currency: text('currency').notNull().default('USD'),
    // NULL = misma moneda que el perfil (tasa implícita 1.0)
    // Ej: cuenta en EUR, perfil en USD → 0.91 significa 1 EUR = 0.91 USD
    exchangeRateToBase: numeric('exchange_rate_to_base', { precision: 18, scale: 8 }),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('financial_accounts_profile_id_idx').on(t.profileId),
  ],
)

export type FinancialAccount = typeof financialAccounts.$inferSelect
export type NewFinancialAccount = typeof financialAccounts.$inferInsert

// ============================================================
// CATEGORIES
// ============================================================

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: categoryTypeEnum('type').notNull(),
    icon: text('icon'),
    color: text('color'),
    isSystem: boolean('is_system').notNull().default(false),
    parentId: uuid('parent_id'), // self-reference añadida después con relations
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('categories_profile_id_idx').on(t.profileId),
    index('categories_parent_id_idx').on(t.parentId),
  ],
)

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

// ============================================================
// TRANSACTIONS
// ============================================================

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id').notNull().references(() => financialAccounts.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    type: transactionTypeEnum('type').notNull(),
    description: text('description'),
    notes: text('notes'),
    date: date('date').notNull(),
    receiptUrl: text('receipt_url'),
    merchant: text('merchant'),
    isTransfer: boolean('is_transfer').notNull().default(false),
    transferToAccountId: uuid('transfer_to_account_id').references(() => financialAccounts.id, { onDelete: 'set null' }),
    // Multi-moneda: solo se populan en transferencias cross-currency.
    // toAmount: monto en la moneda de la cuenta destino.
    // exchangeRate: toAmount / amount (tasa implícita al momento de la transferencia).
    // En Fase 2 se auto-rellena via Frankfurter API; en MVP el usuario lo ingresa manualmente.
    toAmount: numeric('to_amount', { precision: 14, scale: 2 }),
    exchangeRate: numeric('exchange_rate', { precision: 18, scale: 8 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('transactions_profile_id_idx').on(t.profileId),
    index('transactions_account_id_idx').on(t.accountId),
    index('transactions_category_id_idx').on(t.categoryId),
    index('transactions_date_idx').on(t.date),
  ],
)

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert

// ============================================================
// TRANSACTION TAGS
// ============================================================

export const transactionTags = pgTable(
  'transaction_tags',
  {
    transactionId: uuid('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
    tag: text('tag').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.transactionId, t.tag] }),
  ],
)

export type TransactionTag = typeof transactionTags.$inferSelect

// ============================================================
// BUDGETS
// ============================================================

export const budgets = pgTable(
  'budgets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
    limitAmount: numeric('limit_amount', { precision: 14, scale: 2 }).notNull(),
    period: budgetPeriodEnum('period').notNull().default('monthly'),
    startDate: date('start_date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('budgets_profile_id_idx').on(t.profileId),
    index('budgets_category_id_idx').on(t.categoryId),
  ],
)

export type Budget = typeof budgets.$inferSelect
export type NewBudget = typeof budgets.$inferInsert

// ============================================================
// RECURRING TRANSACTIONS
// ============================================================

export const recurringTransactions = pgTable(
  'recurring_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id').notNull().references(() => financialAccounts.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    type: transactionTypeEnum('type').notNull(),
    description: text('description'),
    frequency: recurringFreqEnum('frequency').notNull(),
    nextDueDate: date('next_due_date').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    lastAppliedDate: date('last_applied_date'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('recurring_transactions_profile_id_idx').on(t.profileId),
    index('recurring_transactions_next_due_date_idx').on(t.nextDueDate),
  ],
)

export type RecurringTransaction = typeof recurringTransactions.$inferSelect
export type NewRecurringTransaction = typeof recurringTransactions.$inferInsert

// ============================================================
// SAVINGS GOALS
// ============================================================

export const savingsGoals = pgTable(
  'savings_goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id').references(() => financialAccounts.id, { onDelete: 'set null' }),
    // Solo relevante cuando accountId está presente.
    // Filtra los ingresos de esa cuenta a una categoría específica.
    // NULL = contar TODOS los ingresos de la cuenta.
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    targetAmount: numeric('target_amount', { precision: 14, scale: 2 }).notNull(),
    currentAmount: numeric('current_amount', { precision: 14, scale: 2 }).notNull().default('0'),
    targetDate: date('target_date'),
    iconUrl: text('icon_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('savings_goals_profile_id_idx').on(t.profileId),
  ],
)

export type SavingsGoal = typeof savingsGoals.$inferSelect
export type NewSavingsGoal = typeof savingsGoals.$inferInsert

// ============================================================
// PRODUCTS (seguimiento de precios)
// ============================================================

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    nameRaw: text('name_raw').notNull(),
    nameNormalized: text('name_normalized').notNull(),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    mostRecentPrice: numeric('most_recent_price', { precision: 14, scale: 2 }),
    mostRecentMerchant: text('most_recent_merchant'),
    purchaseCount: integer('purchase_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('products_profile_id_idx').on(t.profileId),
    index('products_name_normalized_idx').on(t.nameNormalized),
  ],
)

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert

// ============================================================
// PRICE HISTORY
// ============================================================

export const priceHistory = pgTable(
  'price_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    productNameNormalized: text('product_name_normalized').notNull(),
    merchant: text('merchant'),
    price: numeric('price', { precision: 14, scale: 2 }).notNull(),
    quantity: numeric('quantity', { precision: 10, scale: 3 }),
    date: date('date').notNull(),
    transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'set null' }),
  },
  (t) => [
    index('price_history_profile_id_idx').on(t.profileId),
    index('price_history_product_name_normalized_idx').on(t.productNameNormalized),
  ],
)

export type PriceHistory = typeof priceHistory.$inferSelect
export type NewPriceHistory = typeof priceHistory.$inferInsert
