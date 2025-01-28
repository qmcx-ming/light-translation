
/**
 * 显示提示消息
 * @param {string} message 信息 
 * @param {'success' | 'warning' | 'info' | 'error'} type 类型
 */
const showMessage = (message, type = 'success') => {
  ElMessage({ message, type, plain: true });
}

export {
  showMessage
}