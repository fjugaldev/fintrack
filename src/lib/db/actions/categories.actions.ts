'use server'

import { and, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'

export async function getCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return db.query.categories.findMany({
    where: eq(categories.profileId, user.id),
    orderBy: (t, { asc }) => [asc(t.type), asc(t.name)],
  })
}

export async function createCategory(data: {
  name: string
  type: 'income' | 'expense'
  icon?: string
  color?: string
  parentId?: string | null
}) {
  const profileId = await getAuthUserId()

  // Si tiene padre, heredar su tipo
  let type = data.type
  if (data.parentId) {
    const parent = await db.query.categories.findFirst({
      where: and(eq(categories.id, data.parentId), eq(categories.profileId, profileId)),
    })
    if (!parent) throw new Error('Categoría padre no encontrada')
    type = parent.type
  }

  const [category] = await db
    .insert(categories)
    .values({
      profileId,
      name: data.name.trim(),
      type,
      icon: data.icon || null,
      color: data.color || null,
      parentId: data.parentId || null,
      isSystem: false,
    })
    .returning()

  revalidatePath('/categories')
  revalidatePath('/transactions')
  return category
}

export async function updateCategory(
  id: string,
  data: { name: string; icon?: string; color?: string },
) {
  const profileId = await getAuthUserId()

  const existing = await db.query.categories.findFirst({
    where: and(eq(categories.id, id), eq(categories.profileId, profileId)),
  })
  if (!existing) throw new Error('Categoría no encontrada')
  if (existing.isSystem) throw new Error('No se pueden editar categorías del sistema')

  const [updated] = await db
    .update(categories)
    .set({
      name: data.name.trim(),
      icon: data.icon || null,
      color: data.color || null,
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, id), eq(categories.profileId, profileId)))
    .returning()

  revalidatePath('/categories')
  revalidatePath('/transactions')
  return updated
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  const profileId = await getAuthUserId()

  const existing = await db.query.categories.findFirst({
    where: and(eq(categories.id, id), eq(categories.profileId, profileId)),
  })
  if (!existing) return { error: 'Categoría no encontrada' }
  if (existing.isSystem) return { error: 'No se pueden eliminar categorías del sistema' }

  // Verificar si tiene subcategorías
  const children = await db.query.categories.findMany({
    where: and(eq(categories.parentId, id), eq(categories.profileId, profileId)),
  })
  if (children.length > 0) {
    return { error: 'Elimina primero las subcategorías antes de eliminar esta categoría' }
  }

  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.profileId, profileId)))

  revalidatePath('/categories')
  revalidatePath('/transactions')
  return {}
}

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return user.id
}

type CategorySeed = {
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  isSystem?: boolean
  children?: Omit<CategorySeed, 'children'>[]
}

const DEFAULT_CATEGORIES: CategorySeed[] = [
  // --- GASTOS ---
  {
    name: 'Alimentación',
    type: 'expense',
    icon: 'ShoppingCart',
    color: '#f97316',
    children: [
      { name: 'Supermercado', type: 'expense', icon: 'ShoppingCart', color: '#f97316' },
      { name: 'Restaurantes', type: 'expense', icon: 'Utensils', color: '#f97316' },
      { name: 'Cafetería', type: 'expense', icon: 'Coffee', color: '#f97316' },
    ],
  },
  {
    name: 'Transporte',
    type: 'expense',
    icon: 'Car',
    color: '#3b82f6',
    children: [
      { name: 'Combustible', type: 'expense', icon: 'Fuel', color: '#3b82f6' },
      { name: 'Transporte público', type: 'expense', icon: 'Bus', color: '#3b82f6' },
      { name: 'Taxi / Rideshare', type: 'expense', icon: 'Car', color: '#3b82f6' },
    ],
  },
  {
    name: 'Salud',
    type: 'expense',
    icon: 'Heart',
    color: '#ef4444',
    children: [
      { name: 'Médico', type: 'expense', icon: 'Activity', color: '#ef4444' },
      { name: 'Farmacia', type: 'expense', icon: 'Pill', color: '#ef4444' },
      { name: 'Gimnasio', type: 'expense', icon: 'Dumbbell', color: '#ef4444' },
    ],
  },
  {
    name: 'Hogar',
    type: 'expense',
    icon: 'Home',
    color: '#8b5cf6',
    children: [
      { name: 'Alquiler / Hipoteca', type: 'expense', icon: 'Key', color: '#8b5cf6' },
      { name: 'Servicios básicos', type: 'expense', icon: 'Zap', color: '#8b5cf6' },
      { name: 'Mantenimiento', type: 'expense', icon: 'Wrench', color: '#8b5cf6' },
    ],
  },
  {
    name: 'Entretenimiento',
    type: 'expense',
    icon: 'Film',
    color: '#ec4899',
    children: [
      { name: 'Streaming', type: 'expense', icon: 'Tv', color: '#ec4899' },
      { name: 'Videojuegos', type: 'expense', icon: 'Gamepad2', color: '#ec4899' },
      { name: 'Salidas', type: 'expense', icon: 'PartyPopper', color: '#ec4899' },
    ],
  },
  {
    name: 'Educación',
    type: 'expense',
    icon: 'BookOpen',
    color: '#06b6d4',
    children: [
      { name: 'Cursos', type: 'expense', icon: 'GraduationCap', color: '#06b6d4' },
      { name: 'Libros', type: 'expense', icon: 'BookOpen', color: '#06b6d4' },
    ],
  },
  {
    name: 'Compras',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#f59e0b',
    children: [
      { name: 'Ropa', type: 'expense', icon: 'Shirt', color: '#f59e0b' },
      { name: 'Electrónica', type: 'expense', icon: 'Smartphone', color: '#f59e0b' },
    ],
  },
  {
    name: 'Servicios',
    type: 'expense',
    icon: 'Wifi',
    color: '#10b981',
    children: [
      { name: 'Internet / Celular', type: 'expense', icon: 'Wifi', color: '#10b981' },
      { name: 'Suscripciones', type: 'expense', icon: 'CreditCard', color: '#10b981' },
    ],
  },
  {
    name: 'Impuestos',
    type: 'expense',
    icon: 'Landmark',
    color: '#6b7280',
    children: [],
  },
  // --- INGRESOS ---
  { name: 'Salario', type: 'income', icon: 'Briefcase', color: '#22c55e' },
  { name: 'Freelance', type: 'income', icon: 'Laptop', color: '#22c55e' },
  { name: 'Bonificación', type: 'income', icon: 'Gift', color: '#22c55e' },
  { name: 'Intereses', type: 'income', icon: 'TrendingUp', color: '#22c55e' },
  { name: 'Otro Ingreso', type: 'income', icon: 'DollarSign', color: '#22c55e' },
  // --- SISTEMA ---
  { name: 'Transferencia', type: 'expense', icon: 'Wallet', color: '#9ca3af', isSystem: true },
  { name: 'Ajuste de Saldo', type: 'expense', icon: 'Banknote', color: '#9ca3af', isSystem: true },
  { name: 'Sin Categoría', type: 'expense', icon: 'Tag', color: '#9ca3af', isSystem: true },
]

// Mapa de emoji → nombre de icono Lucide para migrar datos existentes
const EMOJI_TO_LUCIDE: Record<string, string> = {
  '🛒': 'ShoppingCart',
  '🏪': 'ShoppingCart',
  '🍽️': 'Utensils',
  '☕': 'Coffee',
  '🚗': 'Car',
  '🚕': 'Car',
  '⛽': 'Fuel',
  '🚌': 'Bus',
  '🏥': 'Heart',
  '👨‍⚕️': 'Activity',
  '💊': 'Pill',
  '🏋️': 'Dumbbell',
  '🏠': 'Home',
  '🔑': 'Key',
  '💡': 'Zap',
  '🔧': 'Wrench',
  '🎬': 'Film',
  '📺': 'Tv',
  '🎮': 'Gamepad2',
  '🎉': 'PartyPopper',
  '📚': 'BookOpen',
  '🎓': 'GraduationCap',
  '📖': 'BookOpen',
  '🛍️': 'ShoppingBag',
  '👕': 'Shirt',
  '📱': 'Smartphone',
  '📡': 'Wifi',
  '📶': 'Wifi',
  '🔄': 'CreditCard',
  '🏛️': 'Landmark',
  '💼': 'Briefcase',
  '💻': 'Laptop',
  '🎁': 'Gift',
  '📈': 'TrendingUp',
  '💰': 'DollarSign',
  '↔️': 'Wallet',
  '⚖️': 'Banknote',
  '❓': 'Tag',
}

export async function migrateIconsToLucide() {
  const profileId = await getAuthUserId()
  const emojis = Object.keys(EMOJI_TO_LUCIDE)
  const allCats = await db.query.categories.findMany({
    where: and(
      eq(categories.profileId, profileId),
      inArray(categories.icon, emojis),
    ),
  })
  for (const cat of allCats) {
    const lucideName = EMOJI_TO_LUCIDE[cat.icon ?? '']
    if (!lucideName) continue
    await db
      .update(categories)
      .set({ icon: lucideName })
      .where(and(eq(categories.id, cat.id), eq(categories.profileId, profileId)))
  }
  revalidatePath('/categories')
  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  return { updated: allCats.length }
}

export async function seedDefaultCategories() {
  const profileId = await getAuthUserId()

  for (const cat of DEFAULT_CATEGORIES) {
    const [parent] = await db
      .insert(categories)
      .values({
        profileId,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        isSystem: cat.isSystem ?? false,
        parentId: null,
      })
      .onConflictDoNothing()
      .returning()

    if (!parent || !cat.children?.length) continue

    for (const child of cat.children) {
      await db
        .insert(categories)
        .values({
          profileId,
          name: child.name,
          type: child.type,
          icon: child.icon,
          color: child.color,
          isSystem: false,
          parentId: parent.id,
        })
        .onConflictDoNothing()
    }
  }
}
