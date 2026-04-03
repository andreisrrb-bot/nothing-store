import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Uploads a Buffer to Cloudinary using a Promise.
 */
export async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `nothing-store/${folder}` },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Erreur lors du téléversement Cloudinary'));
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}
