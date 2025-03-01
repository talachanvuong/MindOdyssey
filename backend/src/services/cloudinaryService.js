import { v2 as cloudinary } from 'cloudinary'

const upload = async (source) => {
  if (!source) {
    return
  }

  return await cloudinary.uploader.upload(source)
}

const destroy = async (public_id) => {
  if (!public_id) {
    return
  }

  await cloudinary.uploader.destroy(public_id)
}

export default {
  upload,
  destroy,
}
