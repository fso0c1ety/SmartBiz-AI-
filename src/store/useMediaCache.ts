import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const KEY_PREFIX = '@media_cache_';

export type MediaItem = string | { base64?: string; url?: string };

export const getCachedMediaForContent = async (contentId: string): Promise<string[] | null> => {
  try {
    const raw = await AsyncStorage.getItem(KEY_PREFIX + contentId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const cacheMediaForContent = async (contentId: string, media: MediaItem[]): Promise<string[]> => {
  const uris: string[] = [];
  for (const m of media) {
    const src = typeof m === 'string' ? m : (m.base64 || m.url);
    if (!src) continue;
    if (src.startsWith('data:image')) {
      const ext = src.includes('image/png') ? 'png' : 'jpg';
      const path = FileSystem.cacheDirectory + `smartbiz_${contentId}_${Date.now()}.${ext}`;
      const base64Data = src.split(',')[1];
      await FileSystem.writeAsStringAsync(path, base64Data, { encoding: FileSystem.EncodingType.Base64 });
      uris.push(path);
    } else {
      uris.push(src);
    }
  }
  await AsyncStorage.setItem(KEY_PREFIX + contentId, JSON.stringify(uris));
  return uris;
};
