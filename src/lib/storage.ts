import { del, get, set, keys } from 'idb-keyval';

export interface HistoryItem {
  id: string;
  name: string;
  blob: Blob;
  tool: string;
  timestamp: number;
}

const HISTORY_KEY_PREFIX = 'history_';
const MAX_HISTORY = 100;

export const saveToHistory = async (name: string, blob: Blob, tool: string) => {
  try {
    const id = Date.now().toString();
    const item: HistoryItem = {
      id,
      name,
      blob,
      tool,
      timestamp: Date.now(),
    };
    
    await set(`${HISTORY_KEY_PREFIX}${id}`, item);
    
    // Cleanup old items to keep only the last MAX_HISTORY
    const allKeys = await keys();
    const historyKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(HISTORY_KEY_PREFIX)) as string[];
    
    if (historyKeys.length > MAX_HISTORY) {
      const items = await Promise.all(historyKeys.map(k => get<HistoryItem>(k)));
      const validItems = items.filter(Boolean) as HistoryItem[];
      validItems.sort((a, b) => b.timestamp - a.timestamp);
      
      const toDelete = validItems.slice(MAX_HISTORY);
      await Promise.all(toDelete.map(item => del(`${HISTORY_KEY_PREFIX}${item.id}`)));
    }
  } catch (error) {
    console.error('Failed to save to history', error);
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const allKeys = await keys();
    const historyKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(HISTORY_KEY_PREFIX)) as string[];
    
    const items = await Promise.all(historyKeys.map(k => get<HistoryItem>(k)));
    const validItems = items.filter(Boolean) as HistoryItem[];
    validItems.sort((a, b) => b.timestamp - a.timestamp);
    
    return validItems;
  } catch (error) {
    console.error('Failed to get history', error);
    return [];
  }
};

export const clearHistory = async () => {
  try {
    const allKeys = await keys();
    const historyKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(HISTORY_KEY_PREFIX)) as string[];
    await Promise.all(historyKeys.map(k => del(k)));
  } catch (error) {
    console.error('Failed to clear history', error);
  }
};
