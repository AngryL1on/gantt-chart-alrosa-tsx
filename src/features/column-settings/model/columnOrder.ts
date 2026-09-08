import type { GanttData } from '@/entities/task'

export function defaultColumnOrder(data: GanttData): string[] {
  return ['num', 'name', 'start', 'end', ...data.columns.map((c) => c.id)]
}

export function mergeColumnOrder(prev: string[], next: GanttData): string[] {
  const fixed = prev.filter((k) => k === 'num' || k === 'name' || k === 'start' || k === 'end')
  const fixedOrdered =
    fixed.length === 4 ? fixed : (['num', 'name', 'start', 'end'] as string[])
  const fieldIds = next.columns.map((c) => c.id)
  const keptFields = prev.filter((k) => fieldIds.includes(k))
  const missing = fieldIds.filter((id) => !keptFields.includes(id))
  return [...fixedOrdered, ...keptFields, ...missing]
}

export function reorderColumns(order: string[], fromKey: string, toKey: string): string[] {
  const next = [...order]
  const from = next.indexOf(fromKey)
  const to = next.indexOf(toKey)
  if (from < 0 || to < 0) return order
  next.splice(from, 1)
  next.splice(to, 0, fromKey)
  return next
}
