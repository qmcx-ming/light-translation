const data = {
  googleUrl: 'https://gtranslate.darkluna.top',
}

/**
 * 初始化配置
 */
const init = (force = false) => {
  if(force) {
    setItem('config', data);
    return;
  }
  if (!getItem('config')) {
    setItem('config', data);
  }
}

const setItem = (key, value) => {
  utools.dbStorage.setItem(key, JSON.stringify(value));
}

const removeItem = (key) => {
  utools.dbStorage.removeItem(key);
}

const getItem = (key) => {
  return JSON.parse(utools.dbStorage.getItem(key));
}

export {
  init,
  setItem,
  removeItem,
  getItem,
}