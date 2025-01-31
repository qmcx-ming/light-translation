import { getItem, setItem } from './db';

export const getHistory = () => {
  return getItem('history');
}

export const setHistory = (history) => {
  setItem('history', history);
}