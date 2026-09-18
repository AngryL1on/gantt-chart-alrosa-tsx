import type { GanttData, TaskKind } from '../model/types'
import { blankFields, defaultColumns, makeTask } from '../model/lib'

export function sampleData(): GanttData {
  const f = (dept = '', cipher = '', crit = '') => {
    const a = blankFields()
    a[0] = crit
    a[1] = dept
    a[2] = cipher
    return a
  }

  const node = (
    name: string,
    kind: TaskKind,
    start: string,
    end: string,
    dept = '',
    children: ReturnType<typeof makeTask>[] = [],
  ) =>
    makeTask(name, start, end, {
      kind,
      fields: f(dept),
      children,
    })

  return {
    meta: {
      title: 'План',
      subtitle: 'График выпуска проектной документации',
    },
    columns: defaultColumns(),
    tasks: [
      node('Площадка', 'site', '2026-08-25', '2026-09-06', '', [
        node('Объект', 'object', '2026-08-25', '2026-09-06', '', [
          node('Стадия', 'stage', '2026-08-25', '2026-09-01', '', [
            node('Отдел', 'dept', '', '', 'Бюро ГИПов', [
              node('Книга/Том', 'book', '2026-08-25', '2026-08-28', 'Бюро ГИПов'),
              node('Книга/Том', 'book', '2026-08-27', '2026-08-31', 'Бюро ГИПов'),
            ]),
          ]),
          node('Стадия', 'stage', '2026-09-01', '2026-09-06', '', [
            node('Отдел', 'dept', '', '', 'АСО', [
              node('Комплект', 'set', '2026-09-01', '2026-09-03', 'АСО'),
              node('Комплект', 'set', '2026-09-02', '2026-09-04', 'АСО'),
            ]),
            node('Отдел', 'dept', '', '', 'ГТО', [
              node('Задание', 'assignment', '2026-09-04', '2026-09-05', 'ГТО'),
              node('Комплект', 'set', '2026-09-05', '2026-09-06', 'ГТО'),
            ]),
          ]),
        ]),
      ]),
    ],
  }
}
