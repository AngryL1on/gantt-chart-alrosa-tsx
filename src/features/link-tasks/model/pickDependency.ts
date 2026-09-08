import { message } from 'antd'
import type { Task } from '@/entities/task'
import { wouldCreateCycle } from '@/entities/task'

export type LinkPickResult =
  | { type: 'set_source'; id: string }
  | { type: 'clear_source' }
  | { type: 'abort' }
  | { type: 'toggle'; targetId: string; sourceId: string }

export function resolveLinkPick(
  tasks: Task[],
  linkSourceId: string | null,
  id: string,
): LinkPickResult {
  if (!linkSourceId) {
    message.info('Выберите задачу-последователя')
    return { type: 'set_source', id }
  }
  if (linkSourceId === id) {
    return { type: 'clear_source' }
  }
  if (wouldCreateCycle(tasks, linkSourceId, id)) {
    message.error('Нельзя создать цикл зависимостей')
    return { type: 'abort' }
  }
  return { type: 'toggle', targetId: id, sourceId: linkSourceId }
}

export function applyLinkToggle(node: Task, sourceId: string): void {
  if (node.dependsOn.includes(sourceId)) {
    node.dependsOn = node.dependsOn.filter((d) => d !== sourceId)
    message.success('Зависимость удалена')
  } else {
    node.dependsOn = [...node.dependsOn, sourceId]
    message.success('Зависимость создана')
  }
}
