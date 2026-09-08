import { useCallback, useRef, useState } from 'react'
import type { ColumnDef, FlatRow, FixedColId, Task } from '@/entities/task'
import { Splitter } from '@/shared/ui/splitter'
import { GanttTimeline } from '@/widgets/gantt-timeline'
import { TaskTable } from '@/widgets/task-table'

type Props = {
  rows: FlatRow[]
  tasks: Task[]
  columns: ColumnDef[]
  columnOrder: string[]
  hiddenFixed: Partial<Record<FixedColId, boolean>>
  monthWidth: number
  hoverId: string | null
  linkSourceId: string | null
  linkMode: boolean
  onHover: (id: string | null) => void
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

export function GanttWorkspace({
  rows,
  tasks,
  columns,
  columnOrder,
  hiddenFixed,
  monthWidth,
  hoverId,
  linkSourceId,
  linkMode,
  onHover,
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
  const [leftWidth, setLeftWidth] = useState(780)
  const leftBodyRef = useRef<HTMLDivElement>(null)
  const leftHeadRef = useRef<HTMLDivElement>(null)
  const rightBodyRef = useRef<HTMLDivElement>(null)
  const rightHeadRef = useRef<HTMLDivElement>(null)
  const syncLock = useRef(false)

  const onLeftScroll = useCallback((scrollTop: number) => {
    if (syncLock.current) return
    syncLock.current = true
    if (rightBodyRef.current) rightBodyRef.current.scrollTop = scrollTop
    syncLock.current = false
  }, [])

  const onRightScroll = useCallback((scrollTop: number) => {
    if (syncLock.current) return
    syncLock.current = true
    if (leftBodyRef.current) leftBodyRef.current.scrollTop = scrollTop
    syncLock.current = false
  }, [])

  return (
    <div className="workspace">
      <div className="pane-left" style={{ width: leftWidth }}>
        <TaskTable
          rows={rows}
          columns={columns}
          columnOrder={columnOrder}
          hiddenFixed={hiddenFixed}
          hoverId={hoverId}
          linkSourceId={linkSourceId}
          linkMode={linkMode}
          onHover={onHover}
          onScroll={onLeftScroll}
          bodyRef={leftBodyRef}
          headRef={leftHeadRef}
          onToggle={onToggle}
          onAddChild={onAddChild}
          onDelete={onDelete}
          onPatchTask={onPatchTask}
          onPatchField={onPatchField}
          onRenameColumn={onRenameColumn}
          onHideFieldColumn={onHideFieldColumn}
          onHideFixed={onHideFixed}
          onReorderColumns={onReorderColumns}
          onPickDependency={onPickDependency}
        />
      </div>

      <Splitter onResize={setLeftWidth} />

      <div className="pane-right">
        <GanttTimeline
          rows={rows}
          tasks={tasks}
          monthWidth={monthWidth}
          hoverId={hoverId}
          linkSourceId={linkSourceId}
          linkMode={linkMode}
          onHover={onHover}
          onScroll={onRightScroll}
          bodyRef={rightBodyRef}
          headRef={rightHeadRef}
          onPickDependency={onPickDependency}
        />
      </div>
    </div>
  )
}
