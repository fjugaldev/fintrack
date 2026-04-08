import { Tag } from 'lucide-react'
import { getCategories } from '@/lib/db/actions/categories.actions'
import { getCategoryIcon } from '@/lib/category-icons'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { CreateCategoryDialog } from './_components/create-category-dialog'
import { EditCategoryDialog } from './_components/edit-category-dialog'
import { DeleteCategoryButton } from './_components/delete-category-button'
import type { Category } from '@/lib/db/schema'

export default async function CategoriesPage() {
  const allCategories = await getCategories()

  // Separar padres e hijos
  const parents = allCategories.filter((c) => !c.parentId)
  const childrenByParent = allCategories.reduce<Record<string, Category[]>>((acc, c) => {
    if (!c.parentId) return acc
    if (!acc[c.parentId]) acc[c.parentId] = []
    acc[c.parentId].push(c)
    return acc
  }, {})

  const expenseParents = parents.filter((c) => c.type === 'expense')
  const incomeParents = parents.filter((c) => c.type === 'income')

  // Solo categorías padre (no sistema) disponibles para asignar como padre en el form
  const parentCategoriesForForm = parents.filter((c) => !c.isSystem)

  const totalCustom = allCategories.filter((c) => !c.isSystem).length

  function CategoryRow({ category, isChild = false }: { category: Category; isChild?: boolean }) {
    const children = childrenByParent[category.id] ?? []
    return (
      <>
        <div
          className={`flex items-center gap-3 py-2.5 px-4 ${isChild ? 'pl-10 bg-muted/20' : 'border-b last:border-b-0'}`}
        >
          {/* Color dot */}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: category.color ?? '#9ca3af' }}
          />
          {/* Ícono + nombre */}
          {(() => {
            const CatIcon = getCategoryIcon(category.icon)
            return CatIcon
              ? <CatIcon className="h-4 w-4 shrink-0" style={{ color: category.color ?? '#9ca3af' }} />
              : <span className="text-lg leading-none">{category.icon ?? '📁'}</span>
          })()}
          <span className="flex-1 text-sm font-medium">{category.name}</span>
          {/* Badge sistema */}
          {category.isSystem && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Sistema
            </span>
          )}
          {/* Badge hijos */}
          {!isChild && children.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {children.length} subcategoría{children.length !== 1 ? 's' : ''}
            </span>
          )}
          {/* Acciones */}
          {!category.isSystem && (
            <div className="flex items-center gap-0.5">
              <EditCategoryDialog category={category} parentCategories={parentCategoriesForForm} />
              <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
            </div>
          )}
        </div>
        {/* Subcategorías */}
        {!isChild && children.map((child) => (
          <CategoryRow key={child.id} category={child} isChild />
        ))}
      </>
    )
  }

  function CategorySection({
    title,
    items,
    type,
  }: {
    title: string
    items: Category[]
    type: 'income' | 'expense'
  }) {
    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <h2 className="font-semibold text-sm">{title}</h2>
          <CreateCategoryDialog
            parentCategories={parentCategoriesForForm.filter((c) => c.type === type)}
            defaultType={type}
          />
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground px-4 py-6 text-center">
            No hay categorías de {type === 'expense' ? 'gasto' : 'ingreso'}
          </p>
        ) : (
          <div className="divide-y">
            {items.map((cat) => (
              <CategoryRow key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            {totalCustom} categoría{totalCustom !== 1 ? 's' : ''} personalizadas
          </p>
        </div>
        <CreateCategoryDialog parentCategories={parentCategoriesForForm} />
      </div>

      {allCategories.filter((c) => !c.isSystem).length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Tag />
            </EmptyMedia>
            <EmptyTitle>Sin categorías personalizadas</EmptyTitle>
            <EmptyDescription>
              Crea categorías para organizar tus transacciones a tu manera.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateCategoryDialog parentCategories={parentCategoriesForForm} />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <CategorySection title="Gastos" items={expenseParents} type="expense" />
          <CategorySection title="Ingresos" items={incomeParents} type="income" />
        </div>
      )}
    </div>
  )
}
