/**
 * deviceStorage.ts
 * Saves processed tool output into public, user-visible device storage
 * (not the app's private sandbox), so files show up in the phone's own
 * Photos/Gallery or Files app under a "Toolstrum" folder/album.
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library/legacy';
import { Platform } from 'react-native';

export const TOOLSTRUM_FOLDER_NAME = 'Toolstrum';

const SAF_FOLDER_RECORD_PATH = `${FileSystem.documentDirectory}toolstrum_saf_folder.json`;

const EXTENSION_MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  html: 'text/html',
  htm: 'text/html',
  md: 'text/markdown',
  rtf: 'application/rtf',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  heic: 'image/heic',
  heif: 'image/heif',
  tiff: 'image/tiff',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
  '3gp': 'video/3gpp',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  m4r: 'audio/x-m4r',
  aac: 'audio/aac',
  flac: 'audio/flac',
  ogg: 'audio/ogg',
};

export interface SaveToDeviceResult {
  success: boolean;
  publicUri?: string;
  message: string;
}

function getExtension(fileName: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(fileName);
  return match ? match[1].toLowerCase() : '';
}

function resolveMimeType(fileName: string, mimeType?: string): string {
  if (mimeType) return mimeType;
  return EXTENSION_MIME_MAP[getExtension(fileName)] || 'application/octet-stream';
}

function isMediaLibraryMimeType(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') || mimeType.startsWith('video/') || mimeType.startsWith('audio/')
  );
}

async function saveToMediaLibrary(sourceUri: string): Promise<SaveToDeviceResult> {
  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) {
    return {
      success: false,
      message:
        'Permission to access your Photos library was denied. Enable Photos access in Settings to save files there, or use Share instead.',
    };
  }

  const asset = await MediaLibrary.createAssetAsync(sourceUri);

  try {
    const existingAlbum = await MediaLibrary.getAlbumAsync(TOOLSTRUM_FOLDER_NAME);
    if (existingAlbum) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], existingAlbum, false);
    } else {
      await MediaLibrary.createAlbumAsync(TOOLSTRUM_FOLDER_NAME, asset, false);
    }
  } catch {
    // The asset is already in the library even if album assignment fails.
  }

  return {
    success: true,
    publicUri: asset.uri,
    message: `Saved to Photos in the "${TOOLSTRUM_FOLDER_NAME}" album.`,
  };
}

async function readPersistedAndroidFolderUri(): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(SAF_FOLDER_RECORD_PATH);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(SAF_FOLDER_RECORD_PATH);
    const parsed = JSON.parse(raw);
    return typeof parsed?.directoryUri === 'string' ? parsed.directoryUri : null;
  } catch {
    return null;
  }
}

async function persistAndroidFolderUri(directoryUri: string): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(SAF_FOLDER_RECORD_PATH, JSON.stringify({ directoryUri }));
  } catch {
    // Non-fatal: we'll just re-prompt for a folder next time.
  }
}

async function ensureAndroidFolderUri(): Promise<string | null> {
  const persisted = await readPersistedAndroidFolderUri();
  if (persisted) {
    try {
      await FileSystem.StorageAccessFramework.readDirectoryAsync(persisted);
      return persisted;
    } catch {
      // Permission was revoked or folder removed; fall through to re-request.
    }
  }

  const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  await persistAndroidFolderUri(permission.directoryUri);
  return permission.directoryUri;
}

async function saveDocumentAndroid(
  sourceUri: string,
  fileName: string,
  mimeType: string
): Promise<SaveToDeviceResult> {
  const folderUri = await ensureAndroidFolderUri();
  if (!folderUri) {
    return {
      success: false,
      message: `Folder access was not granted, so "${fileName}" could not be saved to device storage. You can still use Share to save it manually.`,
    };
  }

  const ext = getExtension(fileName);
  const baseName = ext ? fileName.slice(0, -(ext.length + 1)) : fileName;

  const base64 = await FileSystem.readAsStringAsync(sourceUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
    folderUri,
    baseName,
    mimeType
  );
  await FileSystem.writeAsStringAsync(destUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return {
    success: true,
    publicUri: destUri,
    message: `Saved to your device's "${TOOLSTRUM_FOLDER_NAME}" folder.`,
  };
}

async function saveDocumentIOS(sourceUri: string, fileName: string): Promise<SaveToDeviceResult> {
  const folderUri = `${FileSystem.documentDirectory}${TOOLSTRUM_FOLDER_NAME}/`;
  await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true }).catch(() => {});
  const destUri = `${folderUri}${fileName}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });

  return {
    success: true,
    publicUri: destUri,
    message: `Saved in the Files app under "On My iPhone/iPad > ${TOOLSTRUM_FOLDER_NAME}".`,
  };
}

/**
 * Copies a processed file out of the app's private sandbox and into
 * public, user-visible storage: the Photos/gallery library (for images,
 * video and audio, grouped into a "Toolstrum" album) or a "Toolstrum"
 * folder visible in the device's own Files app (for documents/archives).
 */
export async function saveToDeviceStorage(params: {
  sourceUri: string;
  fileName: string;
  mimeType?: string;
}): Promise<SaveToDeviceResult> {
  const { sourceUri, fileName } = params;
  const mimeType = resolveMimeType(fileName, params.mimeType);

  try {
    if (isMediaLibraryMimeType(mimeType)) {
      return await saveToMediaLibrary(sourceUri);
    }
    if (Platform.OS === 'android') {
      return await saveDocumentAndroid(sourceUri, fileName, mimeType);
    }
    return await saveDocumentIOS(sourceUri, fileName);
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || `Could not save "${fileName}" to device storage.`,
    };
  }
}
