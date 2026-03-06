import { App } from 'vue'
import { ElNotification, NotificationOptions } from 'element-plus'

export interface NotificationService {
  notify: (options: NotificationOptions) => void
  success: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  closeAll: () => void
}

const notificationService: NotificationService = {
  notify: (options: NotificationOptions) => {
    ElNotification(options)
  },
  success: (message: string, title: string = 'Success') => {
    ElNotification({
      title,
      message,
      type: 'success',
    })
  },
  warning: (message: string, title: string = 'Warning') => {
    ElNotification({
      title,
      message,
      type: 'warning',
    })
  },
  info: (message: string, title: string = 'Info') => {
    ElNotification({
      title,
      message,
      type: 'info',
    })
  },
  error: (message: string, title: string = 'Error') => {
    ElNotification({
      title,
      message,
      type: 'error',
    })
  },
  closeAll: () => {
    ElNotification.closeAll()
  },
}

const NotificationPlugin = {
  install(app: App) {
    app.config.globalProperties.$notify = notificationService
  },
}

export { NotificationPlugin }
export default notificationService
