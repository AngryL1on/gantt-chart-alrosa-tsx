import {
  ApartmentOutlined,
  ColumnHeightOutlined,
  CompressOutlined,
  DownloadOutlined,
  ExpandOutlined,
  FolderAddOutlined,
  FileAddOutlined,
  PrinterOutlined,
  UploadOutlined,
  UnorderedListOutlined,
  CodeOutlined,
} from '@ant-design/icons'
import { Button, Slider, Space, Tooltip } from 'antd'

type Props = {
  zoom: number
  onZoomChange: (v: number) => void
  linkMode: boolean
  onToggleLinkMode: () => void
  onImport: () => void
  onExport: () => void
  onOpenJson: () => void
  onAddGroup: () => void
  onAddTask: () => void
  onExpandAll: () => void
  onCollapseAll: () => void
  onPrint: () => void
  onOpenColumns: () => void
}

export function GanttToolbar({
  zoom,
  onZoomChange,
  linkMode,
  onToggleLinkMode,
  onImport,
  onExport,
  onOpenJson,
  onAddGroup,
  onAddTask,
  onExpandAll,
  onCollapseAll,
  onPrint,
  onOpenColumns,
}: Props) {
  return (
    <div className="app-toolbar">
      <h1 className="title">Диаграмма Ганта</h1>
      <Space size={6} wrap>
        <Button icon={<UploadOutlined />} onClick={onImport}>
          Импорт JSON
        </Button>
        <Button icon={<DownloadOutlined />} onClick={onExport}>
          Экспорт JSON
        </Button>
        <Button icon={<CodeOutlined />} onClick={onOpenJson}>
          Редактор JSON
        </Button>
        <Button type="primary" icon={<FolderAddOutlined />} onClick={onAddGroup}>
          + Группа
        </Button>
        <Button icon={<FileAddOutlined />} onClick={onAddTask}>
          + Задача
        </Button>
        <Button icon={<ExpandOutlined />} onClick={onExpandAll}>
          Развернуть
        </Button>
        <Button icon={<CompressOutlined />} onClick={onCollapseAll}>
          Свернуть
        </Button>
        <Tooltip title={linkMode ? 'Выйдите из режима или кликните задачу-последователя' : 'Сначала кликните предшественника, затем последователя'}>
          <Button
            type={linkMode ? 'primary' : 'default'}
            danger={linkMode}
            icon={<ApartmentOutlined />}
            onClick={onToggleLinkMode}
          >
            {linkMode ? 'Зависимость…' : 'Зависимость'}
          </Button>
        </Tooltip>
        <Button icon={<UnorderedListOutlined />} onClick={onOpenColumns}>
          Колонки
        </Button>
        <Button icon={<PrinterOutlined />} onClick={onPrint}>
          Печать
        </Button>
      </Space>
      <span className="spacer" />
      <div className="zoom-wrap">
        <ColumnHeightOutlined rotate={90} />
        <span>Масштаб</span>
        <Slider
          min={40}
          max={160}
          value={zoom}
          onChange={onZoomChange}
          tooltip={{ formatter: (v) => `${v}%` }}
        />
      </div>
      <span className="hint">
        Перетаскивайте заголовки · × скрывает колонку · зависимость создаётся в режиме связи
      </span>
    </div>
  )
}
