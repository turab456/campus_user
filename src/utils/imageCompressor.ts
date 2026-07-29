export const compressImage = (file: File, maxWidth = 1024, quality = 0.75): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Only compress images
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert canvas back to a compressed File object
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas compression blob is empty'));
            }
            
            // Build compressed filename with original file extension mapped or webp fallback
            const nameParts = file.name.split('.');
            if (nameParts.length > 1) {
              nameParts[nameParts.length - 1] = 'webp';
            } else {
              nameParts.push('webp');
            }
            const compressedName = nameParts.join('.');

            const compressedFile = new File([blob], compressedName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
