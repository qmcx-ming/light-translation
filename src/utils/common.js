
/**
 * 显示提示消息
 * @param {string} message 信息 
 * @param {'success' | 'warning' | 'info' | 'error'} type 类型
 */
const showMessage = (message, type = 'success') => {
  ElMessage({ message, type, plain: true });
}

/**
 * 处理密钥，根据,分割
 * @param {string} key 密钥
 * @returns
 */
const handleKey = (key) => {
  const [appId, secretKey] = key.split(',')
  return { appId, secretKey }
}

export {
  showMessage,
  handleKey
}