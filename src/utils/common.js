import alibabaLanguage from '../languages/alibaba-language.json';
import baiduLanguage from '../languages/baidu-language.json';
import googleLanguage from '../languages/google-language.json';
import microsoftLanguage from '../languages/microsoft-language.json';
import tencentLanguage from '../languages/tencent-language.json';

let elMessage = null;

/**
 * 显示提示消息
 * @param {string} message 信息 
 * @param {'success' | 'warning' | 'info' | 'error'} type 类型
 */
const showMessage = (message, type = 'success') => {
  if (elMessage) {
    elMessage = elMessage.close(); // 关闭之前的提示
  }
  elMessage = ElMessage({ message, type, plain: true });
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

/**
 * 获取节点(仿照jQuery ಥ_ಥ)
 * @param {string} el 节点选择器
 * @returns 
 */
const $ = (el) => {
  return document.querySelector(el);
}

/**
 * utools打开外部链接
 * @param {string} url 链接
 */
const openURL = (url) => {
  utools.shellOpenExternal(url);
}

/**
 * 去除路径最后的斜杠
 * @param {string} url 路径 
 * @returns 
 */
const removeLastSlash = (url) => {
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
}

const languageMap = Object.freeze({
  alibaba: alibabaLanguage,
  baidu: baiduLanguage,
  google: googleLanguage,
  microsoft: microsoftLanguage,
  tencent: tencentLanguage
})

// 获取对应的语种包
const getEngineLangList = (engine) => languageMap[engine] || [];

export {
  showMessage,
  handleKey,
  $,
  openURL,
  removeLastSlash,
  getEngineLangList
}