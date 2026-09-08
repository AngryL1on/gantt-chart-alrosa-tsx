import { Input } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  cloneData,
  defaultTaskDates,
  findNode,
  makeTask,
  normalize,
  sampleData,
  setCollapsed,
  visibleRows,
  type FixedColId,
  type GanttData,
  type Task,
} from '@/entities/task'
import {
  ColumnsDrawer,
  defaultColumnOrder,
  mergeColumnOrder,
  reorderColumns,
} from '@/features/column-settings'
import { exportGanttJson, importGanttFile, JsonEditorModal } from '@/features/import-export'
import { applyLinkToggle, DepBanner, resolveLinkPick } from '@/features/link-tasks'
import { BASE_MONTH_WIDTH } from '@/shared/config'
import { addDays, fmt, parseDate } from '@/shared/lib/dates'
import { GanttToolbar } from '@/widgets/gantt-toolbar'
import { GanttWorkspace } from '@/widgets/gantt-workspace'

export function GanttPage() {
  const [data, setData] = useState<GanttData>(() => sampleData())
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    defaultColumnOrder(sampleData()),
  )
  const [hiddenFixed, setHiddenFixed] = useState<Partial<Record<FixedColId, boolean>>>({})
  const [zoomPercent, setZoomPercent] = useState(100)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [linkMode, setLinkMode] = useState(false)
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null)
  const [jsonOpen, setJsonOpen] = useState(false)
  const [columnsOpen, setColumnsOpen] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  const rows = useMemo(() => visibleRows(data.tasks), [data.tasks])
  const monthWidth = Math.round((BASE_MONTH_WIDTH * zoomPercent) / 100)

  const applyData = useCallback((raw: unknown) => {
    const next = normalize(raw)
    setData(next)
    setColumnOrder((prev) => mergeColumnOrder(prev, next))
    setHiddenFixed({})
  }, [])

  const updateNode = useCallback((id: string, mutator: (node: Task) => void) => {
    setData((prev) => {
      const next = cloneData(prev)
      const found = findNode(id, next.tasks)
      if (found) mutator(found.node)
      return next
    })
  }, [])

  useEffect(() => {
    const onDragOver = (e: DragEvent) => e.preventDefault()
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer?.files?.[0]
      if (file && /\.json$/i.test(file.name)) void importGanttFile(file, applyData)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLinkMode(false)
        setLinkSourceId(null)
      }
    }
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('drop', onDrop)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('drop', onDrop)
      window.removeEventListener('keydown', onKey)
    }
  }, [applyData])

  const addGroup = () => {
    const dates = defaultTaskDates(30)
    const group = makeTask('Новая группа', dates.start, dates.end)
    group.children.push(
      makeTask('Новая задача', dates.start, fmt(addDays(new Date(), 14))),
    )
    setData((prev) => ({ ...prev, tasks: [...prev.tasks, group] }))
  }

  const addTask = () => {
    const dates = defaultTaskDates(14)
    setData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, makeTask('Новая задача', dates.start, dates.end)],
    }))
  }

  const pickDependency = (id: string) => {
    if (!linkMode) return
    const result = resolveLinkPick(data.tasks, linkSourceId, id)
    switch (result.type) {
      case 'set_source':
        setLinkSourceId(result.id)
        break
      case 'clear_source':
        setLinkSourceId(null)
        break
      case 'abort':
        setLinkSourceId(null)
        setLinkMode(false)
        break
      case 'toggle':
        updateNode(result.targetId, (node) => applyLinkToggle(node, result.sourceId))
        setLinkSourceId(null)
        setLinkMode(false)
        break
    }
  }

  return (
    <div className="app-shell">
      <GanttToolbar
        zoom={zoomPercent}
        onZoomChange={setZoomPercent}
        linkMode={linkMode}
        onToggleLinkMode={() => {
          setLinkMode((v) => !v)
          setLinkSourceId(null)
        }}
        onImport={() => fileRef.current?.click()}
        onExport={() => exportGanttJson(data)}
        onOpenJson={() => setJsonOpen(true)}
        onAddGroup={addGroup}
        onAddTask={addTask}
        onExpandAll={() =>
          setData((prev) => {
            const next = cloneData(prev)
            setCollapsed(next.tasks, false)
            return next
          })
        }
        onCollapseAll={() =>
          setData((prev) => {
            const next = cloneData(prev)
            setCollapsed(next.tasks, true)
            return next
          })
        }
        onPrint={() => window.print()}
        onOpenColumns={() => setColumnsOpen(true)}
      />

      {linkMode && (
        <DepBanner
          linkSourceId={linkSourceId}
          onCancel={() => {
            setLinkMode(false)
            setLinkSourceId(null)
          }}
        />
      )}

      <div className="doc-head">
        <Input
          className="doc-title"
          value={data.meta.title}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              meta: { ...prev.meta, title: e.target.value },
            }))
          }
        />
        <Input
          className="doc-subtitle"
          value={data.meta.subtitle}
          placeholder="Объект, площадка или пояснение к графику"
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              meta: { ...prev.meta, subtitle: e.target.value },
            }))
          }
        />
      </div>

      <GanttWorkspace
        rows={rows}
        tasks={data.tasks}
        columns={data.columns}
        columnOrder={columnOrder}
        hiddenFixed={hiddenFixed}
        monthWidth={monthWidth}
        hoverId={hoverId}
        linkSourceId={linkSourceId}
        linkMode={linkMode}
        onHover={setHoverId}
        onToggle={(id) =>
          updateNode(id, (node) => {
            node.collapsed = !node.collapsed
          })
        }
        onAddChild={(id) =>
          updateNode(id, (node) => {
            const start = node.start || fmt(new Date())
            const end =
              node.end || fmt(addDays(parseDate(start) || new Date(), 10))
            node.children.push(makeTask('Новая задача', start, end))
            node.collapsed = false
          })
        }
        onDelete={(id) =>
          setData((prev) => {
            const next = cloneData(prev)
            const found = findNode(id, next.tasks)
            if (found) found.list.splice(found.index, 1)
            return next
          })
        }
        onPatchTask={(id, patch) => updateNode(id, (node) => Object.assign(node, patch))}
        onPatchField={(id, index, value) =>
          updateNode(id, (node) => {
            node.fields[index] = value
          })
        }
        onRenameColumn={(index, title) =>
          setData((prev) => {
            const next = cloneData(prev)
            if (next.columns[index]) next.columns[index].title = title
            return next
          })
        }
        onHideFieldColumn={(index) =>
          setData((prev) => {
            const next = cloneData(prev)
            if (next.columns[index]) next.columns[index].hidden = true
            return next
          })
        }
        onHideFixed={(id) => setHiddenFixed((prev) => ({ ...prev, [id]: true }))}
        onReorderColumns={(fromKey, toKey) =>
          setColumnOrder((prev) => reorderColumns(prev, fromKey, toKey))
        }
        onPickDependency={pickDependency}
      />

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void importGanttFile(file, applyData)
          e.target.value = ''
        }}
      />

      <JsonEditorModal
        open={jsonOpen}
        data={data}
        onClose={() => setJsonOpen(false)}
        onApply={applyData}
      />

      <ColumnsDrawer
        open={columnsOpen}
        onClose={() => setColumnsOpen(false)}
        columns={data.columns}
        hiddenFixed={hiddenFixed}
        onToggleField={(index, hidden) =>
          setData((prev) => {
            const next = cloneData(prev)
            if (next.columns[index]) next.columns[index].hidden = hidden
            return next
          })
        }
        onToggleFixed={(id, hidden) =>
          setHiddenFixed((prev) => ({ ...prev, [id]: hidden }))
        }
        onShowAll={() => {
          setHiddenFixed({})
          setData((prev) => {
            const next = cloneData(prev)
            next.columns.forEach((c) => {
              c.hidden = false
            })
            return next
          })
        }}
      />
    </div>
  )
}
