import { FIXED_COL_IDS, type GanttData } from '@/entities/task'

export function defaultColumnOrder(data: GanttData): string[] {
  const fields = data.columns.map((c) => c.id)
  const first = fields[0]
  const rest = fields.slice(1)
  return ['start', 'end', 'duration', first, 'name', ...rest, 'num'].filter(
    (k): k is string => Boolean(k),
  )
}

export function mergeColumnOrder(prev: string[], next: GanttData): string[] {
  const knownFixed = new Set<string>(FIXED_COL_IDS)
  const fromPrev = prev.filter((k) => knownFixed.has(k))
  const missingFixed = FIXED_COL_IDS.filter((id) => !fromPrev.includes(id))
  const fixedOrdered = fromPrev.length ? [...fromPrev, ...missingFixed] : [...FIXED_COL_IDS]
  const fieldIds = next.columns.map((c) => c.id)
  const keptFields = prev.filter((k) => fieldIds.includes(k))
  const missing = fieldIds.filter((id) => !keptFields.includes(id))
  const leftoverFixed = fixedOrdered.filter((k) => !prev.includes(k))
  const merged = [...prev.filter((k) => knownFixed.has(k) || fieldIds.includes(k))]
  for (const id of leftoverFixed) {
    if (!merged.includes(id)) merged.push(id)
  }
  for (const id of missing) {
    if (!merged.includes(id)) merged.push(id)
  }
  return merged
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
