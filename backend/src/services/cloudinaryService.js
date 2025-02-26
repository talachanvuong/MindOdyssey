import { v2 as cloudinary } from 'cloudinary'

const upload = async (link) => {
  if (!link) {
    return
  }

  return await cloudinary.uploader.upload(link)
}

const destroy = async (public_id) => {
  await cloudinary.uploader.destroy(public_id)
}

export default {
  upload,
  destroy,
}
