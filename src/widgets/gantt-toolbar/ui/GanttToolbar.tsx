import {
  ApartmentOutlined,
  CodeOutlined,
  ColumnHeightOutlined,
  CompressOutlined,
  ExpandOutlined,
  FileAddOutlined,
  FileExcelOutlined,
  FolderAddOutlined,
  PrinterOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Button, DatePicker, Radio, Slider, Space, Tooltip } from 'antd'
import type { Dayjs } from 'dayjs'
import { VIEW_MODE_OPTIONS, type ViewMode } from '@/shared/config'

type Props = {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  period: [Dayjs, Dayjs]
  onPeriodChange: (value: [Dayjs, Dayjs] | null) => void
  onResetPeriod: () => void
  zoom: number
  onZoomChange: (v: number) => void
  linkMode: boolean
  onToggleLinkMode: () => void
  onImport: () => void
  onExportXlsx: () => void
  onExportJson: () => void
  onOpenJson: () => void
  onAddGroup: () => void
  onAddTask: () => void
  onExpandAll: () => void
  onCollapseAll: () => void
  onPrint: () => void
  onOpenColumns: () => void
}

export function GanttToolbar({
  viewMode,
  onViewModeChange,
  period,
  onPeriodChange,
  onResetPeriod,
  zoom,
  onZoomChange,
  linkMode,
  onToggleLinkMode,
  onImport,
  onExportXlsx,
  onExportJson,
  onOpenJson,
  onAddGroup,
  onAddTask,
  onExpandAll,
  onCollapseAll,
  onPrint,
  onOpenColumns,
}: Props) {
  return (
    <div className="control-panel">
      <div className="control-label">Контрольная панель</div>

      <div className="control-card">
        <Button type="primary" icon={<FileExcelOutlined />} onClick={onExportXlsx}>
          Экспорт
        </Button>
        <span className="period-label">Период</span>
        <DatePicker.RangePicker
          value={period}
          format="DD.MM.YYYY"
          allowEmpty={[false, false]}
          onChange={(dates) => {
            if (!dates?.[0] || !dates[1]) {
              onPeriodChange(null)
              return
            }
            onPeriodChange([dates[0], dates[1]])
          }}
        />
        <Tooltip title="Сбросить период по данным графика">
          <Button icon={<ReloadOutlined />} onClick={onResetPeriod} />
        </Tooltip>
        <span className="spacer" />
        <Space size={6} wrap>
          <Button icon={<UploadOutlined />} onClick={onImport}>
            Импорт JSON
          </Button>
          <Button onClick={onExportJson}>JSON</Button>
          <Button icon={<CodeOutlined />} onClick={onOpenJson} />
          <Button icon={<UnorderedListOutlined />} onClick={onOpenColumns}>
            Колонки
          </Button>
          <Button icon={<PrinterOutlined />} onClick={onPrint} />
        </Space>
      </div>

      <div className="plan-bar">
        <span className="plan-title">План</span>
        <Radio.Group
          value={viewMode}
          onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
        >
          {VIEW_MODE_OPTIONS.map((opt) => (
            <Radio key={opt.value} value={opt.value}>
              {opt.label}
            </Radio>
          ))}
        </Radio.Group>
        <Space size={6} wrap>
          <Button type="primary" icon={<FolderAddOutlined />} onClick={onAddGroup}>
            Группа
          </Button>
          <Button icon={<FileAddOutlined />} onClick={onAddTask}>
            Задача
          </Button>
          <Button icon={<ExpandOutlined />} onClick={onExpandAll}>
            Развернуть
          </Button>
          <Button icon={<CompressOutlined />} onClick={onCollapseAll}>
            Свернуть
          </Button>
          <Tooltip
            title={
              linkMode
                ? 'Выйдите из режима или кликните задачу-последователя'
                : 'Сначала кликните предшественника, затем последователя'
            }
          >
            <Button
              type={linkMode ? 'primary' : 'default'}
              danger={linkMode}
              icon={<ApartmentOutlined />}
              onClick={onToggleLinkMode}
            >
              {linkMode ? 'Зависимость…' : 'Зависимость'}
            </Button>
          </Tooltip>
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
      </div>
    </div>
  )
}
