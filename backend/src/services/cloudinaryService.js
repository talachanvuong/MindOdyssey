import { v2 as cloudinary } from 'cloudinary'

export const uploadCloudinary = async (link) => {
  if (!link) {
    return
  }

  return await cloudinary.uploader.upload(link)
}

export const destroyCloudinary = async (public_id) => {
  await cloudinary.uploader.destroy(public_id)
}

export const restoreCloudinary = async (public_id) => {
  await cloudinary.api.restore(public_id)
}
