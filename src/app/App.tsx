import { AntdProvider } from './providers'
import { GanttPage } from '@/pages/gantt-page'

export function App() {
  return (
    <AntdProvider>
      <GanttPage />
    </AntdProvider>
  )
}
