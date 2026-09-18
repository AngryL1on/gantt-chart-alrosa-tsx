import {
  CaretDownOutlined,
  CaretRightOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { DatePicker, Input } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from 'react'
import {
  durationDays,
  FIXED_COL_IDS,
  rowToneClass,
  type ColumnDef,
  type FlatRow,
  type FixedColId,
  type Task,
} from '@/entities/task'
import { fmt, parseDate } from '@/shared/lib/dates'

const FIXED_META: Record<
  FixedColId,
  { label: string; widthClass: string; width: number; canHide: boolean }
> = {
  num: { label: '№', widthClass: 'w-num', width: 54, canHide: true },
  name: { label: 'Тип карточки TDMS', widthClass: 'w-name', width: 156, canHide: false },
  start: { label: 'Фактическая дата начала', widthClass: 'w-date', width: 104, canHide: true },
  end: { label: 'Фактическая дата окончания', widthClass: 'w-date', width: 104, canHide: true },
  duration: {
    label: 'Фактическая длительность',
    widthClass: 'w-duration',
    width: 86,
    canHide: true,
  },
}

const FIXED_SET = new Set<string>(FIXED_COL_IDS)

export type VisibleColumn =
  | { key: string; kind: 'fixed'; id: FixedColId }
  | { key: string; kind: 'field'; id: string; index: number }

type Props = {
  rows: FlatRow[]
  columns: ColumnDef[]
  columnOrder: string[]
  hiddenFixed: Partial<Record<FixedColId, boolean>>
  hoverId: string | null
  linkSourceId: string | null
  linkMode: boolean
  onHover: (id: string | null) => void
  onScroll: (scrollTop: number, scrollLeft: number) => void
  bodyRef: React.RefObject<HTMLDivElement | null>
  headRef: React.RefObject<HTMLDivElement | null>
  onToggle: (id: string) => void
  onAddChild: (id: string) => void
  onDelete: (id: string) => void
  onPatchTask: (id: string, patch: Partial<Pick<Task, 'name' | 'start' | 'end'>>) => void
  onPatchField: (id: string, index: number, value: string) => void
  onRenameColumn: (index: number, title: string) => void
  onHideFieldColumn: (index: number) => void
  onHideFixed: (id: FixedColId) => void
  onReorderColumns: (fromKey: string, toKey: string) => void
  onPickDependency: (id: string) => void
}

function toDayjs(s: string): Dayjs | null {
  const d = parseDate(s)
  return d ? dayjs(d) : null
}

export function TaskTable({
  rows,
  columns,
  columnOrder,
  hiddenFixed,
  hoverId,
  linkSourceId,
  linkMode,
  onHover,
  onScroll,
  bodyRef,
  headRef,
  onToggle,
  onAddChild,
  onDelete,
  onPatchTask,
  onPatchField,
  onRenameColumn,
  onHideFieldColumn,
  onHideFixed,
  onReorderColumns,
  onPickDependency,
}: Props) {
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [overKey, setOverKey] = useState<string | null>(null)
  const syncing = useRef(false)

  const visibleCols = useMemo((): VisibleColumn[] => {
    const result: VisibleColumn[] = []
    for (const key of columnOrder) {
      if (FIXED_SET.has(key)) {
        const id = key as FixedColId
        if (hiddenFixed[id]) continue
        result.push({ key, kind: 'fixed', id })
      } else {
        const idx = columns.findIndex((c) => c.id === key)
        if (idx < 0 || columns[idx].hidden) continue
        result.push({ key, kind: 'field', id: key, index: idx })
      }
    }
    return result
  }, [columnOrder, columns, hiddenFixed])

  const nameIndex = useMemo(
    () => visibleCols.findIndex((col) => col.kind === 'fixed' && col.id === 'name'),
    [visibleCols],
  )

  const tableWidth = useMemo(() => {
    return visibleCols.reduce((sum, col) => {
      if (col.kind === 'fixed') return sum + FIXED_META[col.id].width
      return sum + 96
    }, 0)
  }, [visibleCols])

  const handleBodyScroll = useCallback(() => {
    const body = bodyRef.current
    const head = headRef.current
    if (!body || syncing.current) return
    syncing.current = true
    if (head) head.scrollLeft = body.scrollLeft
    onScroll(body.scrollTop, body.scrollLeft)
    syncing.current = false
  }, [bodyRef, headRef, onScroll])

  const onDragStart = (e: DragEvent, key: string) => {
    setDragKey(key)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', key)
  }

  const onDragOver = (e: DragEvent, key: string) => {
    e.preventDefault()
    if (key !== overKey) setOverKey(key)
  }

  const onDrop = (e: DragEvent, key: string) => {
    e.preventDefault()
    const from = e.dataTransfer.getData('text/plain') || dragKey
    if (from && from !== key) onReorderColumns(from, key)
    setDragKey(null)
    setOverKey(null)
  }

  const onDragEnd = () => {
    setDragKey(null)
    setOverKey(null)
  }

  const cellClass = (index: number, extra = '') => {
    const plain = nameIndex < 0 || index < nameIndex
    return `${extra}${plain ? ' col-plain' : ''}`.trim()
  }

  const renderHeadCell = (col: VisibleColumn): ReactNode => {
    if (col.kind === 'fixed') {
      const meta = FIXED_META[col.id]
      return (
        <th
          key={col.key}
          className={`${meta.widthClass} draggable${dragKey === col.key ? ' dragging' : ''}${overKey === col.key ? ' drag-over' : ''}`}
          draggable
          onDragStart={(e) => onDragStart(e, col.key)}
          onDragOver={(e) => onDragOver(e, col.key)}
          onDrop={(e) => onDrop(e, col.key)}
          onDragEnd={onDragEnd}
          title="Перетащите, чтобы изменить порядок"
        >
          {meta.label}
          {meta.canHide && (
            <button
              type="button"
              className="col-hide-btn"
              title="Скрыть колонку"
              onClick={(e) => {
                e.stopPropagation()
                onHideFixed(col.id)
              }}
            >
              ×
            </button>
          )}
        </th>
      )
    }

    const def = columns[col.index]
    return (
      <th
        key={col.key}
        className={`w-text draggable${dragKey === col.key ? ' dragging' : ''}${overKey === col.key ? ' drag-over' : ''}`}
        draggable
        onDragStart={(e) => onDragStart(e, col.key)}
        onDragOver={(e) => onDragOver(e, col.key)}
        onDrop={(e) => onDrop(e, col.key)}
        onDragEnd={onDragEnd}
        title="Перетащите, чтобы изменить порядок"
      >
        <input
          className="col-title-input"
          value={def.title}
          placeholder={`Колонка ${col.index + 1}`}
          onChange={(e) => onRenameColumn(col.index, e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          draggable={false}
        />
        <button
          type="button"
          className="col-hide-btn"
          title="Скрыть колонку"
          onClick={(e) => {
            e.stopPropagation()
            onHideFieldColumn(col.index)
          }}
        >
          ×
        </button>
      </th>
    )
  }

  const renderBodyCell = (row: FlatRow, col: VisibleColumn, index: number): ReactNode => {
    const { task, level } = row
    const has = task.children.length > 0

    if (col.kind === 'fixed') {
      if (col.id === 'num') {
        return (
          <td key={col.key} className={cellClass(index, 'w-num')}>
            <div className="num">{row.num}</div>
          </td>
        )
      }
      if (col.id === 'name') {
        return (
          <td key={col.key} className={cellClass(index, 'w-name')}>
            <div className="name-wrap" style={{ paddingLeft: 6 + level * 14 }}>
              {has ? (
                <button
                  type="button"
                  className="twist"
                  title="Скрыть / показать"
                  onClick={() => onToggle(task.id)}
                >
                  {task.collapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
                </button>
              ) : (
                <button type="button" className="twist empty">
                  <CaretRightOutlined />
                </button>
              )}
              <input
                className="cell-input cell-name"
                value={task.name}
                onChange={(e) => onPatchTask(task.id, { name: e.target.value })}
              />
              <div className="row-actions">
                <button
                  type="button"
                  className="icon-btn"
                  title="Добавить дочернюю"
                  onClick={() => onAddChild(task.id)}
                >
                  <PlusOutlined />
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  title="Удалить"
                  onClick={() => onDelete(task.id)}
                >
                  <MinusOutlined />
                </button>
              </div>
            </div>
          </td>
        )
      }
      if (col.id === 'start' || col.id === 'end') {
        return (
          <td key={col.key} className={cellClass(index, 'w-date')}>
            <DatePicker
              size="small"
              variant="borderless"
              format="DD.MM.YYYY"
              placeholder=""
              style={{ width: '100%' }}
              value={toDayjs(task[col.id])}
              allowClear
              onChange={(v) =>
                onPatchTask(task.id, {
                  [col.id]: v ? fmt(v.toDate()) : '',
                })
              }
            />
          </td>
        )
      }
      if (col.id === 'duration') {
        const days = durationDays(task)
        return (
          <td key={col.key} className={cellClass(index, 'w-duration')}>
            <div className="num">{days ?? ''}</div>
          </td>
        )
      }
    }

    if (col.kind !== 'field') return null

    return (
      <td key={col.key} className={cellClass(index, 'w-text')}>
        <Input
          className="cell-input"
          variant="borderless"
          value={task.fields[col.index] ?? ''}
          onChange={(e) => onPatchField(task.id, col.index, e.target.value)}
        />
      </td>
    )
  }

  if (!rows.length) {
    return (
      <>
        <div className="pane-head" ref={headRef} />
        <div className="pane-body" ref={bodyRef}>
          <div className="empty-pane">Нет задач. Добавьте группу или загрузите JSON.</div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="pane-head" ref={headRef}>
        <table className="grid-table" style={{ width: tableWidth }}>
          <thead>
            <tr>{visibleCols.map(renderHeadCell)}</tr>
          </thead>
        </table>
      </div>
      <div className="pane-body" ref={bodyRef} onScroll={handleBodyScroll}>
        <table className="grid-table" style={{ width: tableWidth }}>
          <tbody>
            {rows.map((row) => {
              const has = row.task.children.length > 0
              const classes = [
                rowToneClass(row.task, row.level, has),
                hoverId === row.task.id ? 'hover' : '',
                linkSourceId === row.task.id ? 'link-source' : '',
                linkMode ? 'link-target-ready' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <tr
                  key={row.task.id}
                  className={classes}
                  data-id={row.task.id}
                  onMouseEnter={() => onHover(row.task.id)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => {
                    if (linkMode) onPickDependency(row.task.id)
                  }}
                >
                  {visibleCols.map((col, index) => renderBodyCell(row, col, index))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
