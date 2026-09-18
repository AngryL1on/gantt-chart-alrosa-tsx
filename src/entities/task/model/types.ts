export type ColumnDef = {
  id: string
  title: string
  hidden?: boolean
}

export const TASK_KINDS = [
  'site',
  'object',
  'stage',
  'dept',
  'book',
  'set',
  'assignment',
] as const

export type TaskKind = (typeof TASK_KINDS)[number]

export type Task = {
  id: string
  name: string
  start: string
  end: string
  kind?: TaskKind
  fields: string[]
  collapsed: boolean
  dependsOn: string[]
  children: Task[]
}

export type GanttMeta = {
  title: string
  subtitle: string
}

export type GanttData = {
  meta: GanttMeta
  columns: ColumnDef[]
  tasks: Task[]
}

export type FlatRow = {
  task: Task
  level: number
  num: string
  hidden: boolean
}

export type DateSpan = {
  min: Date
  max: Date
}

export type MonthCell = {
  y: number
  m: number
}

export const FIXED_COL_IDS = ['num', 'name', 'start', 'end', 'duration'] as const
export type FixedColId = (typeof FIXED_COL_IDS)[number]

export type ColumnOrderItem =
  | { kind: 'fixed'; id: FixedColId }
  | { kind: 'field'; id: string; index: number }

export const COLS = 10
