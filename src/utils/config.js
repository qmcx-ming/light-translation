import { getItem, setItem } from './db';

export const getConfig = () => {
  return getItem('config');
}

export const setConfig = (config) => {
  return setItem('config', config);
}

export const getEngineName = (engine) => {
  return engineList.find(item=> item.id === engine).name;
}

export const engineList = [
  {
    id: 'google',
    name: '谷歌翻译',
  },
  {
    id: 'microsoft',
    name: '微软翻译',
  },
  {
    id: 'baidu',
    name: '百度翻译',
  },
  {
    id: 'alibaba',
    name: '阿里翻译',
  },
  {
    id: 'tencent',
    name: '腾讯翻译',
  }
]