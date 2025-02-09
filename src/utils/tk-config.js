import { getItem, setItem } from './db';

const initData = {
  cachedToken: null, // 缓存 token
  tokenExpireTime: 0 // 记录 token 的真实过期时间
}

export const getConfig = () => {
  return getItem('tk-config') || initData;
}

export const setConfig = (config) => {
  return setItem('tk-config', config);
}
