import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import type { ReactNode } from 'react'
import { ganttTheme } from '@/shared/config'

type Props = {
  children: ReactNode
}

export function AntdProvider({ children }: Props) {
  return (
    <ConfigProvider theme={ganttTheme} locale={ruRU}>
      {children}
    </ConfigProvider>
  )
}
