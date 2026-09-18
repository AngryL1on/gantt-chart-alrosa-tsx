import { Button, Modal, Input, Typography, message } from 'antd'
import { useState } from 'react'
import type { GanttData } from '@/entities/task'

const { TextArea } = Input

type Props = {
  open: boolean
  data: GanttData
  onClose: () => void
  onApply: (raw: unknown) => void
}

export function JsonEditorModal({ open, data, onClose, onApply }: Props) {
  return (
    <Modal
      title="Данные графика (JSON)"
      open={open}
      onCancel={onClose}
      width={920}
      styles={{ body: { height: 520, display: 'flex', flexDirection: 'column', paddingTop: 12 } }}
      footer={null}
      destroyOnHidden
    >
      {open ? (
        <JsonEditorForm data={data} onClose={onClose} onApply={onApply} />
      ) : null}
    </Modal>
  )
}

function JsonEditorForm({
  data,
  onClose,
  onApply,
}: Omit<Props, 'open'>) {
  const [text, setText] = useState(() => JSON.stringify(data, null, 2))

  const apply = () => {
    try {
      const parsed = JSON.parse(text) as unknown
      onApply(parsed)
      onClose()
      message.success('JSON применён')
    } catch (err) {
      message.error(`Ошибка JSON: ${(err as Error).message}`)
    }
  }

  return (
    <>
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        style={{
          flex: 1,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: 12,
          lineHeight: 1.45,
          resize: 'none',
        }}
      />
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 8, fontSize: 11 }}>
        Формат: meta.title / meta.subtitle, columns[{'{'}id,title,hidden{'}'}] - 10 текстовых
        колонок, tasks[{'{'}id, name, start, end, kind, fields[10], collapsed, dependsOn,
        children{'}'}]. kind: site, object, stage, dept, book, set, assignment.
        Даты в виде YYYY-MM-DD.
      </Typography.Paragraph>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <Button onClick={onClose}>Закрыть</Button>
        <Button type="primary" onClick={apply}>
          Применить
        </Button>
      </div>
    </>
  )
}
