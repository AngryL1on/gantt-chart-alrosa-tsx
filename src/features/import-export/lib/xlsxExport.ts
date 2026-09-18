import writeExcelFile from 'write-excel-file/browser'
import type { Cell, SheetData } from 'write-excel-file/browser'
import { message } from 'antd'
import {
  durationDays,
  flatten,
  taskRange,
  type GanttData,
  type TaskKind,
} from '@/entities/task'
import { fmtRu, parseDate } from '@/shared/lib/dates'

const KIND_FILL: Record<TaskKind, string> = {
  site: '#A8D06C',
  object: '#7ECFD8',
  stage: '#6AA6DC',
  dept: '#FFFFFF',
  book: '#ECD77A',
  set: '#EDC49A',
  assignment: '#CFCFCF',
}

const HEADER: Omit<Cell, 'value'> = {
  fontWeight: 'bold',
  backgroundColor: '#F0F0F0',
  borderColor: '#C0C0C0',
  borderStyle: 'thin',
  align: 'center',
  alignVertical: 'center',
  wrap: true,
}

function textCell(value: string, fill?: string, extra: Partial<Cell> = {}): Cell {
  return {
    type: String,
    value,
    backgroundColor: fill,
    borderColor: '#C0C0C0',
    borderStyle: 'thin',
    alignVertical: 'center',
    ...extra,
  }
}

function dateCell(iso: string, fill?: string): Cell {
  const d = parseDate(iso)
  if (!d) return textCell('', fill)
  return {
    type: Date,
    value: d,
    format: 'dd.mm.yyyy',
    backgroundColor: fill,
    borderColor: '#C0C0C0',
    borderStyle: 'thin',
    align: 'center',
    alignVertical: 'center',
  }
}

function numberCell(value: number | null, fill?: string): Cell {
  if (value == null) return textCell('', fill, { align: 'center' })
  return {
    type: Number,
    value,
    backgroundColor: fill,
    borderColor: '#C0C0C0',
    borderStyle: 'thin',
    align: 'center',
    alignVertical: 'center',
  }
}

function safeFileName(title: string): string {
  const s = title.replace(/[<>:"/\\|?*]+/g, ' ').trim() || 'plan'
  return `${s}.xlsx`
}

export async function exportGanttXlsx(data: GanttData): Promise<void> {
  try {
    const visibleColumns = data.columns.filter((c) => !c.hidden)
    const rows = flatten(data.tasks)
    const fillOf = (kind?: TaskKind) => (kind ? KIND_FILL[kind] : undefined)

    const headerRow: Cell[] = [
      { ...HEADER, value: '№' },
      { ...HEADER, value: 'Тип карточки TDMS' },
      { ...HEADER, value: 'Фактическая дата начала' },
      { ...HEADER, value: 'Фактическая дата окончания' },
      { ...HEADER, value: 'Фактическая длительность' },
      ...visibleColumns.map((c) => ({ ...HEADER, value: c.title || c.id })),
    ]

    let min: Date | null = null
    let max: Date | null = null
    for (const row of rows) {
      const r = taskRange(row.task)
      if (r.start && (!min || r.start < min)) min = r.start
      if (r.end && (!max || r.end > max)) max = r.end
    }

    const periodLine =
      min && max
        ? `${data.meta.subtitle ? `${data.meta.subtitle}. ` : ''}Период: ${fmtRu(min)} - ${fmtRu(max)}`
        : data.meta.subtitle || ''

    const sheet: SheetData = [
      [
        {
          value: data.meta.title || 'План',
          fontWeight: 'bold',
          fontSize: 14,
          columnSpan: headerRow.length,
        },
      ],
      [
        {
          value: periodLine,
          columnSpan: headerRow.length,
        },
      ],
      headerRow,
      ...rows.map((row) => {
        const fill = fillOf(row.task.kind)
        return [
          textCell(row.num, fill, { align: 'center' }),
          textCell(row.task.name, fill, { indent: row.level }),
          dateCell(row.task.start, fill),
          dateCell(row.task.end, fill),
          numberCell(durationDays(row.task), fill),
          ...visibleColumns.map((col) => {
            const srcIndex = data.columns.findIndex((c) => c.id === col.id)
            return textCell(row.task.fields[srcIndex] ?? '', fill)
          }),
        ]
      }),
    ]

    await writeExcelFile(sheet, {
      sheet: 'План',
      stickyRowsCount: 3,
      columns: [
        { width: 8 },
        { width: 28 },
        { width: 18 },
        { width: 20 },
        { width: 16 },
        ...visibleColumns.map(() => ({ width: 22 })),
      ],
    }).toFile(safeFileName(data.meta.title || 'plan'))
    message.success('Файл Excel сохранён')
  } catch (err) {
    message.error(`Не удалось сохранить XLSX: ${(err as Error).message}`)
  }
}
