import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { Button, Drawer, List, Space, Switch, Typography } from 'antd'
import type { ColumnDef, FixedColId } from '@/entities/task'

const FIXED_LABELS: Partial<Record<FixedColId, string>> = {
  start: 'Дата начала',
  end: 'Дата окончания',
}

type Props = {
  open: boolean
  onClose: () => void
  columns: ColumnDef[]
  hiddenFixed: Partial<Record<FixedColId, boolean>>
  onToggleField: (index: number, hidden: boolean) => void
  onToggleFixed: (id: FixedColId, hidden: boolean) => void
  onShowAll: () => void
}

export function ColumnsDrawer({
  open,
  onClose,
  columns,
  hiddenFixed,
  onToggleField,
  onToggleFixed,
  onShowAll,
}: Props) {
  return (
    <Drawer
      title="Видимость колонок"
      open={open}
      onClose={onClose}
      size={360}
      extra={
        <Button type="link" onClick={onShowAll}>
          Показать все
        </Button>
      }
    >
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        Скрытые колонки не отображаются в таблице. Порядок меняется перетаскиванием
        заголовков.
      </Typography.Paragraph>

      <Typography.Title level={5}>Фиксированные</Typography.Title>
      <List
        size="small"
        dataSource={(['start', 'end'] as FixedColId[])}
        renderItem={(id) => (
          <List.Item
            actions={[
              <Switch
                key="sw"
                checked={!hiddenFixed[id]}
                onChange={(checked) => onToggleFixed(id, !checked)}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
              />,
            ]}
          >
            {FIXED_LABELS[id]}
          </List.Item>
        )}
      />

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Текстовые поля
      </Typography.Title>
      <List
        size="small"
        dataSource={columns.map((c, index) => ({ ...c, index }))}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Switch
                key="sw"
                checked={!item.hidden}
                onChange={(checked) => onToggleField(item.index, !checked)}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
              />,
            ]}
          >
            <Space>
              <Typography.Text code>{item.id}</Typography.Text>
              <span>{item.title || `Колонка ${item.index + 1}`}</span>
            </Space>
          </List.Item>
        )}
      />
    </Drawer>
  )
}
