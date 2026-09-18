import { theme } from 'antd'
import type { ThemeConfig } from 'antd'

/** Light TDMS-like schedule chrome: gray panels, colored WBS rows. */
export const ganttTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1677ff',
    colorInfo: '#1677ff',
    colorSuccess: '#389e0d',
    colorError: '#c62828',
    colorWarning: '#c47a1a',
    colorBgBase: '#f3f3f3',
    colorBgContainer: '#ffffff',
    colorBorder: '#d0d0d0',
    colorText: '#1a1a1a',
    colorTextSecondary: '#4a4a4a',
    borderRadius: 2,
    fontFamily:
      '"Segoe UI", "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
    fontSize: 13,
    controlHeight: 28,
  },
  components: {
    Button: {
      primaryShadow: 'none',
      borderRadius: 2,
    },
    Input: {
      activeBorderColor: '#1677ff',
      hoverBorderColor: '#69b1ff',
    },
    Slider: {
      trackBg: '#1677ff',
      trackHoverBg: '#4096ff',
      handleColor: '#1677ff',
    },
    Radio: {
      wrapperMarginInlineEnd: 12,
    },
  },
}
