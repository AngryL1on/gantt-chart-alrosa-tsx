import type { DateSpan, MonthCell, Task } from '@/entities/task'
import { taskRange } from '@/entities/task'

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
    const now = new Date()
    min = new Date(now.getFullYear(), now.getMonth(), 1)
    max = new Date(now.getFullYear(), now.getMonth() + 5, 1)
  }

  return {
    min: new Date(min.getFullYear(), min.getMonth(), 1),
    max: new Date(max.getFullYear(), max.getMonth() + 1, 0),
  }
}

export function monthList(span: DateSpan): MonthCell[] {
  const list: MonthCell[] = []
  const d = new Date(span.min.getFullYear(), span.min.getMonth(), 1)
  const last = new Date(span.max.getFullYear(), span.max.getMonth(), 1)
  while (d <= last) {
    list.push({ y: d.getFullYear(), m: d.getMonth() })
    d.setMonth(d.getMonth() + 1)
  }
  return list
}

export function dayIndex(span: DateSpan, date: Date): number {
  const t0 = Date.UTC(span.min.getFullYear(), span.min.getMonth(), span.min.getDate())
  const t1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.round((t1 - t0) / 86400000)
}

export function spanDays(span: DateSpan): number {
  return dayIndex(span, span.max) + 1
}

export function yearGroups(months: MonthCell[]): { y: number; count: number }[] {
  const years: { y: number; count: number }[] = []
  months.forEach((m) => {
    const last = years[years.length - 1]
    if (!last || last.y !== m.y) years.push({ y: m.y, count: 1 })
    else last.count++
  })
  return years
}
