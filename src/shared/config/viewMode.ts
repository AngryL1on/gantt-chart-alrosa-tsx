export type ViewMode = 'all' | 'table' | 'chart'

export const VIEW_MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'table', label: 'Только таблица' },
  { value: 'chart', label: 'Только диаграмма' },
  { value: 'all', label: 'Все' },
]
