import type { GanttData } from '../model/types'
import { blankFields, defaultColumns, makeTask } from '../model/lib'

export function sampleData(): GanttData {
  const f = (unit: string, qty: string) => {
    const a = blankFields()
    a[0] = unit
    a[1] = qty
    return a
  }

  const a = makeTask('Ограждение котлована', '2026-01-12', '2026-02-20', {
    fields: f('п.м.', '420'),
  })
  const b = makeTask('Разработка котлована', '2026-02-16', '2026-04-10', {
    fields: f('м³', '18500'),
    dependsOn: [a.id],
  })
  const c = makeTask('Устройство фундамента', '2026-04-06', '2026-06-15', {
    fields: f('%', '100'),
    dependsOn: [b.id],
  })
  const d = makeTask('Монолитные стены', '2026-06-10', '2026-09-30', {
    fields: f('м³', '6400'),
    dependsOn: [c.id],
  })
  const e = makeTask('Перекрытие станционного комплекса', '2026-09-20', '2026-12-18', {
    fields: f('м²', '3100'),
    dependsOn: [d.id],
  })

  const f1 = makeTask('Проходка левого тоннеля', '2026-03-01', '2026-08-20', {
    fields: f('п.м.', '860'),
  })
  const f2 = makeTask('Проходка правого тоннеля', '2026-04-10', '2026-09-28', {
    fields: f('п.м.', '860'),
    dependsOn: [f1.id],
  })
  const f3 = makeTask('Обделка и гидроизоляция', '2026-08-15', '2026-12-25', {
    fields: f('%', '100'),
    dependsOn: [f2.id],
  })

  const g1 = makeTask('Отделка платформенного зала', '2027-01-08', '2027-04-30', {
    fields: f('%', '100'),
  })
  const g2 = makeTask('Инженерные сети и оснащение', '2027-02-01', '2027-06-15', {
    fields: f('%', '100'),
    dependsOn: [g1.id],
  })
  const g3 = makeTask('Пусконаладка и ввод', '2027-06-01', '2027-07-20', {
    fields: f('компл.', '1'),
    dependsOn: [g2.id],
  })

  return {
    meta: {
      title: 'Укрупнённый график производства работ',
      subtitle: 'Объект: станция «Технопарк» (пример данных, колонки можно переименовать)',
    },
    columns: defaultColumns(),
    tasks: [
      {
        ...makeTask('Первоочередной этап', '2026-01-12', '2026-12-25'),
        children: [
          {
            ...makeTask('СМР со стороны проспекта Андропова', '2026-01-12', '2026-12-18'),
            children: [a, b, c, d, e],
          },
          {
            ...makeTask('Тоннельные работы', '2026-03-01', '2026-12-25'),
            children: [f1, f2, f3],
          },
        ],
      },
      {
        ...makeTask('Основной этап', '2027-01-08', '2027-07-20'),
        children: [
          {
            ...makeTask('Архитектурно-отделочный комплекс', '2027-01-08', '2027-07-20'),
            children: [g1, g2, g3],
          },
        ],
      },
    ],
  }
}
