import { message } from 'antd'
import type { GanttData } from '@/entities/task'

export function exportGanttJson(data: GanttData, filename = 'gantt.json'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export async function importGanttFile(
  file: File,
  applyData: (raw: unknown) => void,
): Promise<void> {
  try {
    const text = await file.text()
    applyData(JSON.parse(text))
    message.success('Файл загружен')
  } catch (err) {
    message.error(`Не удалось прочитать JSON: ${(err as Error).message}`)
  }
}
