import { addDays, fmt, parseDate } from '@/shared/lib/dates'
import { COLS, type ColumnDef, type FlatRow, type GanttData, type Task } from './types'

export function uid(): string {
  return `t_${Math.random().toString(36).slice(2, 10)}`
}

export function blankFields(): string[] {
  return Array.from({ length: COLS }, () => '')
}

export function defaultColumns(): ColumnDef[] {
  return Array.from({ length: COLS }, (_, i) => ({
    id: `c${i + 1}`,
    title: i === 0 ? 'Ед. изм.' : i === 1 ? 'Кол-во' : `Колонка ${i + 1}`,
    hidden: false,
  }))
}

export function makeTask(
  name: string,
  start: string,
  end: string,
  extra: Partial<Pick<Task, 'fields' | 'dependsOn' | 'children' | 'collapsed'>> = {},
): Task {
  return {
    id: uid(),
    name,
    start,
    end,
    fields: extra.fields ?? blankFields(),
    collapsed: extra.collapsed ?? false,
    dependsOn: extra.dependsOn ?? [],
    children: extra.children ?? [],
  }
}

export function cloneData<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

export function findNode(
  id: string,
  list: Task[],
  parent: Task | null = null,
): { node: Task; list: Task[]; index: number; parent: Task | null } | null {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return { node: list[i], list, index: i, parent }
    const inner = findNode(id, list[i].children, list[i])
    if (inner) return inner
  }
  return null
}

export function taskRange(task: Task): { start: Date | null; end: Date | null } {
  let start = parseDate(task.start)
  let end = parseDate(task.end)
  if (end && start && end < start) end = start
  for (const ch of task.children) {
    const r = taskRange(ch)
    if (r.start && (!start || r.start < start)) start = r.start
    if (r.end && (!end || r.end > end)) end = r.end
  }
  return { start, end }
}

export function flatten(
  tasks: Task[],
  level = 0,
  prefix = '',
  parentHidden = false,
  out: FlatRow[] = [],
): FlatRow[] {
  tasks.forEach((task, i) => {
    const num = prefix ? `${prefix}.${i + 1}` : String(i + 1)
    out.push({ task, level, num, hidden: parentHidden })
    if (task.children.length) {
      flatten(task.children, level + 1, num, parentHidden || task.collapsed, out)
    }
  })
  return out
}

export function visibleRows(tasks: Task[]): FlatRow[] {
  return flatten(tasks).filter((r) => !r.hidden)
}

export function setCollapsed(tasks: Task[], value: boolean): void {
  for (const t of tasks) {
    if (t.children.length) t.collapsed = value
    setCollapsed(t.children, value)
  }
}

export function collectTaskIds(
  tasks: Task[],
  out: { id: string; name: string; num: string }[] = [],
  prefix = '',
): { id: string; name: string; num: string }[] {
  tasks.forEach((task, i) => {
    const num = prefix ? `${prefix}.${i + 1}` : String(i + 1)
    out.push({ id: task.id, name: task.name, num })
    if (task.children.length) collectTaskIds(task.children, out, num)
  })
  return out
}

export function wouldCreateCycle(tasks: Task[], fromId: string, toId: string): boolean {
  if (fromId === toId) return true
  const map = new Map<string, string[]>()
  const walk = (list: Task[]) => {
    for (const t of list) {
      map.set(t.id, [...t.dependsOn])
      walk(t.children)
    }
  }
  walk(tasks)
  const deps = map.get(toId) ?? []
  if (!deps.includes(fromId)) {
    map.set(toId, [...deps, fromId])
  }
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const dfs = (id: string): boolean => {
    if (visiting.has(id)) return true
    if (visited.has(id)) return false
    visiting.add(id)
    for (const d of map.get(id) ?? []) {
      if (dfs(d)) return true
    }
    visiting.delete(id)
    visited.add(id)
    return false
  }
  for (const id of map.keys()) {
    if (dfs(id)) return true
  }
  return false
}

export function normalize(raw: unknown): GanttData {
  const data: GanttData = {
    meta: {
      title: 'Укрупнённый график производства работ',
      subtitle: '',
    },
    columns: defaultColumns(),
    tasks: [],
  }

  if (!raw || typeof raw !== 'object') return data
  const src = raw as Partial<GanttData>

  data.meta.title = src.meta?.title || data.meta.title
  data.meta.subtitle = src.meta?.subtitle || ''

  if (Array.isArray(src.columns) && src.columns.length) {
    data.columns = Array.from({ length: COLS }, (_, i) => ({
      id: src.columns![i]?.id || `c${i + 1}`,
      title: src.columns![i]?.title || `Колонка ${i + 1}`,
      hidden: !!src.columns![i]?.hidden,
    }))
  }

  const walk = (list: unknown): Task[] =>
    (Array.isArray(list) ? list : []).map((item) => {
      const t = (item ?? {}) as Partial<Task>
      const fields = blankFields()
      if (Array.isArray(t.fields)) {
        t.fields.slice(0, COLS).forEach((v, i) => {
          fields[i] = v == null ? '' : String(v)
        })
      }
      return {
        id: t.id || uid(),
        name: t.name || 'Задача',
        start: t.start || '',
        end: t.end || '',
        fields,
        collapsed: !!t.collapsed,
        dependsOn: Array.isArray(t.dependsOn) ? t.dependsOn.map(String) : [],
        children: walk(t.children),
      }
    })

  data.tasks = walk(src.tasks)
  return data
}

export function todayIso(): string {
  return fmt(new Date())
}

export function defaultTaskDates(days = 14): { start: string; end: string } {
  const start = new Date()
  return { start: fmt(start), end: fmt(addDays(start, days)) }
}
