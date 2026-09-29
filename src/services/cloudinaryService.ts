import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
}

const STORAGE_KEY = 'tkmfoss_cloudinary_config';

export const getCloudinaryConfig = (): CloudinaryConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse Cloudinary config from localStorage', e);
  }

  return {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || ''
  };
};

export const saveCloudinaryConfig = (config: CloudinaryConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const config = getCloudinaryConfig();
  if (!config.cloudName || !config.uploadPreset) {
    throw new Error('Cloudinary Cloud Name or Upload Preset is not configured yet. Configure it in Settings or use Firebase Storage.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Cloudinary upload failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.secure_url || data.url;
};

export const uploadToFirebaseStorage = async (file: File, folder = 'uploads'): Promise<string> => {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${Date.now()}_${sanitizedName}`;
  const storageRef = ref(storage, path);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Universal smart upload:
 * 1. Checks if Cloudinary is configured -> Uses Cloudinary
 * 2. Else tries Firebase Storage
 * 3. Fallback to Base64 data URL if storage rules require permission or keys pending
 */
export const smartUploadImage = async (
  file: File, 
  preferredService: 'auto' | 'cloudinary' | 'firebase' = 'auto'
): Promise<{ url: string; service: 'cloudinary' | 'firebase' | 'base64' }> => {
  const config = getCloudinaryConfig();
  
  if (preferredService === 'cloudinary' || (preferredService === 'auto' && config.cloudName && config.uploadPreset)) {
    try {
      const url = await uploadToCloudinary(file);
      return { url, service: 'cloudinary' };
    } catch (err) {
      console.warn('Cloudinary upload attempt failed, trying fallback...', err);
      if (preferredService === 'cloudinary') throw err;
    }
  }

  try {
    const url = await uploadToFirebaseStorage(file);
    return { url, service: 'firebase' };
  } catch (fbErr) {
    console.warn('Firebase Storage upload failed (possibly storage rules or permission), using local data URL fallback:', fbErr);
    const url = await fileToBase64(file);
    return { url, service: 'base64' };
  }
};
