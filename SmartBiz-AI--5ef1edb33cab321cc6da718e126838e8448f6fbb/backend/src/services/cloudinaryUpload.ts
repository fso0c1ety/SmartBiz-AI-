import cloudinary from 'cloudinary';

// If CLOUDINARY_URL is set, the SDK will auto-configure. No need to manually set config here.

export async function uploadImageToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      {
        resource_type: 'image',
        public_id: filename,
        folder: 'ai-uploads',
        overwrite: true,
      },
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
}
