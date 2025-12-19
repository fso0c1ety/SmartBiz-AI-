import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const KEY_PREFIX = '@media_cache_v2_';

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
  const mediaDir = FileSystem.documentDirectory + 'media/';
  await FileSystem.makeDirectoryAsync(mediaDir, { intermediates: true });
  const uris: string[] = [];
  for (const m of media) {
    const src = typeof m === 'string' ? m : (m.base64 || m.url);
    if (!src) continue;
    if (src.startsWith('data:image')) {
      const ext = src.includes('image/png') ? 'png' : 'jpg';
      const path = mediaDir + `smartbiz_${contentId}_${Date.now()}.${ext}`;
      const base64Data = src.split(',')[1];
      await FileSystem.writeAsStringAsync(path, base64Data, { encoding: FileSystem.EncodingType.Base64 });
      uris.push('file://' + path);
    } else if (src.startsWith('http')) {
      // Download and cache HTTP images
      const ext = 'jpg'; // assume
      const path = mediaDir + `smartbiz_${contentId}_${Date.now()}.${ext}`;
      try {
        console.log('📸 Downloading image:', src, 'to', path);
        await FileSystem.downloadAsync(src, path);
        console.log('📸 Download successful, URI:', 'file://' + path);
        uris.push('file://' + path);
      } catch (e) {
        console.warn('Failed to download image:', src, e);
        uris.push(src); // fallback to URL
      }
    } else {
      uris.push(src);
    }
  }
  await AsyncStorage.setItem(KEY_PREFIX + contentId, JSON.stringify(uris));
  return uris;
};
