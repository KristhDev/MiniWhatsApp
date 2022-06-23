import cloudinary from 'cloudinary';

export const deleteImage = async (image: string) => {
    const nameArr = image.split('/');
    const name = nameArr.slice(nameArr.length - 3).join('/');

    const [ publicId, ext ] = name.split('.');

    await cloudinary.v2.uploader.destroy(publicId);
}