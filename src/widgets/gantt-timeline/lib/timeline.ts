import type { DateSpan, Task } from '@/entities/task'
import { taskRange } from '@/entities/task'
import { addDays, MONTHS_RU_CAP, pad, startOfDay } from '@/shared/lib/dates'

export type TimeScale = 'day' | 'week' | 'month'

export type TimeCell = {
  key: string
  label: string
  y: number
  m: number
}

export type TimeGroup = {
  key: string
  label: string
  count: number
}

export function projectSpan(tasks: Task[]): DateSpan {
  let min: Date | null = null
  let max: Date | null = null

  const visit = (list: Task[]) => {
    for (const t of list) {
      const r = taskRange(t)
      if (r.start && (!min || r.start < min)) min = r.start
      if (r.end && (!max || r.end > max)) max = r.end
      visit(t.children)
    }
  }
  visit(tasks)

  if (!min || !max) {
    const now = startOfDay(new Date())
    return { min: now, max: addDays(now, 13) }
  }

  return { min: startOfDay(min), max: startOfDay(max) }
}

export function pickScale(span: DateSpan): TimeScale {
  const n = spanDays(span)
  if (n <= 45) return 'day'
  if (n <= 184) return 'week'
  return 'month'
}

export function dayIndex(span: DateSpan, date: Date): number {
  const t0 = Date.UTC(span.min.getFullYear(), span.min.getMonth(), span.min.getDate())
  const t1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.round((t1 - t0) / 86400000)
}

export function spanDays(span: DateSpan): number {
  return Math.max(dayIndex(span, span.max) + 1, 1)
}

export function timeCells(span: DateSpan, scale: TimeScale): TimeCell[] {
  const list: TimeCell[] = []
  if (scale === 'day') {
    const d = startOfDay(span.min)
    const last = startOfDay(span.max)
    while (d <= last) {
      list.push({
        key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
        label: `${pad(d.getDate())} ${MONTHS_RU_CAP[d.getMonth()]}`,
        y: d.getFullYear(),
        m: d.getMonth(),
      })
      d.setDate(d.getDate() + 1)
    }
    return list
  }

  if (scale === 'week') {
    const d = startOfDay(span.min)
    const last = startOfDay(span.max)
    while (d <= last) {
      list.push({
        key: `${d.getFullYear()}-w-${d.getMonth()}-${d.getDate()}`,
        label: `${pad(d.getDate())} ${MONTHS_RU_CAP[d.getMonth()]}`,
        y: d.getFullYear(),
        m: d.getMonth(),
      })
      d.setDate(d.getDate() + 7)
    }
    return list
  }

  const d = new Date(span.min.getFullYear(), span.min.getMonth(), 1)
  const last = new Date(span.max.getFullYear(), span.max.getMonth(), 1)
  while (d <= last) {
    list.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTHS_RU_CAP[d.getMonth()],
      y: d.getFullYear(),
      m: d.getMonth(),
    })
    d.setMonth(d.getMonth() + 1)
  }
  return list
}

export function timeGroups(cells: TimeCell[], scale: TimeScale): TimeGroup[] {
  const groups: TimeGroup[] = []
  cells.forEach((cell) => {
    const key = scale === 'month' ? String(cell.y) : `${cell.y}-${cell.m}`
    const label =
      scale === 'month' ? String(cell.y) : `${MONTHS_RU_CAP[cell.m]} ${cell.y}`
    const last = groups[groups.length - 1]
    if (!last || last.key !== key) groups.push({ key, label, count: 1 })
    else last.count++
  })
  return groups
}
