import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveFeedCache = async (items: any[]) => {
  try {
    await AsyncStorage.setItem('@feed_cache', JSON.stringify(items));
  } catch {}
};

export const loadFeedCache = async (): Promise<any[] | null> => {
  try {
    const raw = await AsyncStorage.getItem('@feed_cache');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveChatCache = async (agentId: string, messages: any[]) => {
  try {
    await AsyncStorage.setItem(`@chat_cache_${agentId}`, JSON.stringify(messages));
  } catch {}
};

export const loadChatCache = async (agentId: string): Promise<any[] | null> => {
  try {
    const raw = await AsyncStorage.getItem(`@chat_cache_${agentId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
