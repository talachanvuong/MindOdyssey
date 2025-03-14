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

const reUploadCloudinary = async (url) => {
  if (!url) {
    return
  }
  try {
    const result = await cloudinary.uploader.upload(url)
    return { url: result.secure_url, public_id: result.public_id }
  } catch (error) {
    console.error('Error during upload cloundinary:', error)
    throw error
  }
}

const reuploadAttachments = async (data) => {
  for (const item of data) {
    const uploadPromises = item.contents.map(async (content) => {
      if (content.attachment && content.attachment_id) {
        try {
          const uploadResult = await reUploadCloudinary(content.attachment)
          content.attachment = uploadResult.url
          content.attachment_id = uploadResult.public_id
        } catch (error) {
          console.error(`Failed to upload ${content.attachment_id}`, error)
        }
      }
    })
    await Promise.all(uploadPromises)
  }

  return data
}

export default {
  upload,
  destroy,
  reuploadAttachments,
}
