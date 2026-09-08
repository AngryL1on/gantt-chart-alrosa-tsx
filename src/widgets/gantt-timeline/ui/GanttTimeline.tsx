import { useCallback, useMemo, useRef } from 'react'
import type { FlatRow, Task } from '@/entities/task'
import { taskRange } from '@/entities/task'
import { ROW_HEIGHT } from '@/shared/config'
import { fmt, MONTHS_RU } from '@/shared/lib/dates'
import {
  dayIndex,
  monthList,
  projectSpan,
  spanDays,
  yearGroups,
} from '../lib/timeline'

type Props = {
  rows: FlatRow[]
  tasks: Task[]
  monthWidth: number
  hoverId: string | null
  linkSourceId: string | null
  linkMode: boolean
  onHover: (id: string | null) => void
  onScroll: (scrollTop: number, scrollLeft: number) => void
  bodyRef: React.RefObject<HTMLDivElement | null>
  headRef: React.RefObject<HTMLDivElement | null>
  onPickDependency: (id: string) => void
}

function lvlClass(level: number, hasChildren: boolean): string {
  if (hasChildren && level === 0) return 'lvl-0'
  if (hasChildren && level === 1) return 'lvl-1'
  if (hasChildren) return 'lvl-2'
  return 'lvl-n'
}

export function GanttTimeline({
  rows,
  tasks,
  monthWidth,
  hoverId,
  linkSourceId,
  linkMode,
  onHover,
  onScroll,
  bodyRef,
  headRef,
  onPickDependency,
}: Props) {
  const syncing = useRef(false)

  const span = useMemo(() => projectSpan(tasks), [tasks])
  const months = useMemo(() => monthList(span), [span])
  const years = useMemo(() => yearGroups(months), [months])
  const total = useMemo(() => spanDays(span), [span])
  const tw = months.length * monthWidth

  const today = new Date()
  const todayLeft = (dayIndex(span, today) / total) * tw
  const showToday = today >= span.min && today <= span.max

  const handleBodyScroll = useCallback(() => {
    const body = bodyRef.current
    const head = headRef.current
    if (!body || syncing.current) return
    syncing.current = true
    if (head) head.scrollLeft = body.scrollLeft
    onScroll(body.scrollTop, body.scrollLeft)
    syncing.current = false
  }, [bodyRef, headRef, onScroll])

  const links = useMemo(() => {
    const vis = new Map(rows.map((r, i) => [r.task.id, { ...r, index: i }]))
    const paths: { d: string; tip: string }[] = []

    rows.forEach((row) => {
      ;(row.task.dependsOn || []).forEach((depId) => {
        const from = vis.get(depId)
        const to = vis.get(row.task.id)
        if (!from || !to) return
        const a = taskRange(from.task)
        const b = taskRange(to.task)
        if (!a.end || !b.start) return
        const x1 = ((dayIndex(span, a.end) + 1) / total) * tw
        const x2 = (dayIndex(span, b.start) / total) * tw
        const y1 = from.index * ROW_HEIGHT + ROW_HEIGHT / 2
        const y2 = to.index * ROW_HEIGHT + ROW_HEIGHT / 2
        const mid = Math.max(x1 + 10, (x1 + x2) / 2)
        paths.push({
          d: `M ${x1} ${y1} L ${mid} ${y1} L ${mid} ${y2} L ${x2} ${y2}`,
          tip: `${x2},${y2} ${x2 - 7},${y2 - 3.5} ${x2 - 7},${y2 + 3.5}`,
        })
      })
    })
    return paths
  }, [rows, span, total, tw])

  return (
    <>
      <div className="pane-head" ref={headRef}>
        <div className="gantt-head" style={{ width: tw, ['--gantt-mw' as string]: `${monthWidth}px` }}>
          <div className="gantt-years">
            {years.map((y) => (
              <div key={y.y} className="y-cell" style={{ width: y.count * monthWidth }}>
                {y.y}
              </div>
            ))}
          </div>
          <div className="gantt-months">
            {months.map((m) => (
              <div
                key={`${m.y}-${m.m}`}
                className="m-cell"
                style={{ width: monthWidth }}
              >
                {MONTHS_RU[m.m]}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pane-body" ref={bodyRef} onScroll={handleBodyScroll}>
        {!rows.length ? null : (
          <div
            className="gantt-canvas"
            style={{ width: tw, ['--gantt-mw' as string]: `${monthWidth}px` }}
          >
            {rows.map((row) => {
              const has = row.task.children.length > 0
              const r = taskRange(row.task)
              let bar: React.ReactNode = null
              if (r.start && r.end) {
                const left = (dayIndex(span, r.start) / total) * tw
                const dur = Math.max(dayIndex(span, r.end) - dayIndex(span, r.start) + 1, 1)
                const width = Math.max((dur / total) * tw, 4)
                bar = (
                  <div
                    className={`bar${has ? ' group' : ''}${linkSourceId === row.task.id ? ' dep-pick' : ''}`}
                    style={{ left, width }}
                    title={`${row.task.name}: ${fmt(r.start)} - ${fmt(r.end)}`}
                    onClick={(e) => {
                      if (!linkMode) return
                      e.stopPropagation()
                      onPickDependency(row.task.id)
                    }}
                  />
                )
              }
              const classes = [
                'gantt-row',
                lvlClass(row.level, has),
                hoverId === row.task.id ? 'hover' : '',
                linkSourceId === row.task.id ? 'link-source' : '',
                linkMode ? 'link-target-ready' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <div
                  key={row.task.id}
                  className={classes}
                  style={{ width: tw }}
                  onMouseEnter={() => onHover(row.task.id)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => {
                    if (linkMode) onPickDependency(row.task.id)
                  }}
                >
                  {bar}
                </div>
              )
            })}
            {showToday && <div className="today-line" style={{ left: todayLeft }} />}
            <svg
              className="links-svg"
              viewBox={`0 0 ${tw} ${rows.length * ROW_HEIGHT}`}
              style={{ height: rows.length * ROW_HEIGHT }}
            >
              {links.map((p, i) => (
                <g key={i}>
                  <path d={p.d} fill="none" stroke="#c62828" strokeWidth="1.4" />
                  <polygon points={p.tip} fill="#c62828" />
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>
    </>
  )
}
