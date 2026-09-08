import { theme } from 'antd'
import type { ThemeConfig } from 'antd'

/** Industrial schedule UI: navy chrome, emerald bars, cool slate neutrals. */
export const ganttTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1b365d',
    colorInfo: '#1b365d',
    colorSuccess: '#2e7d4f',
    colorError: '#c62828',
    colorWarning: '#c47a1a',
    colorBgBase: '#eef1f5',
    colorBgContainer: '#ffffff',
    colorBorder: '#c3ccd6',
    colorText: '#1a2330',
    colorTextSecondary: '#445066',
    borderRadius: 6,
    fontFamily:
      '"IBM Plex Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    fontSize: 13,
    controlHeight: 32,
  },
  components: {
    Layout: {
      headerBg: '#1b365d',
      headerHeight: 48,
      headerPadding: '0 12px',
      bodyBg: '#eef1f5',
    },
    Button: {
      primaryShadow: 'none',
    },
    Table: {
      headerBg: '#2a4a73',
      headerColor: '#fff',
      borderColor: '#c3ccd6',
      rowHoverBg: 'rgba(91, 130, 181, 0.12)',
      cellPaddingBlock: 4,
      cellPaddingInline: 6,
    },
    Input: {
      activeBorderColor: '#1b365d',
      hoverBorderColor: '#5b82b5',
    },
    Slider: {
      trackBg: '#2e7d4f',
      trackHoverBg: '#246b43',
      handleColor: '#2e7d4f',
    },
  },
}
