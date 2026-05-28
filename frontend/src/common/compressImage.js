// frontend/src/common/compressImage.js

import imageCompression from "browser-image-compression";

export const compressImage = async (file, options = {}) => {
  if (!file) return null;

  const defaultOptions = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  };

  const compressedFile = await imageCompression(file, {
    ...defaultOptions,
    ...options,
  });

  compressedFile.name = file.name;

  return compressedFile;
};
