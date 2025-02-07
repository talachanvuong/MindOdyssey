import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '../db/db.js'
import {
  destroyCloudinary,
  restoreCloudinary,
} from '../services/cloudinaryService.js'

export const transactionHandler = (fn) => async (req, res, next) => {
  // For cloudinary
  const images = {
    uploadedImages: [],
    destroyedImages: [],
  }

  try {
    await startTransaction()
    await fn(images, req, res, next)
    await commitTransaction()
  } catch (err) {
    for (const uploadedImage of images.uploadedImages) {
      await destroyCloudinary(uploadedImage)
    }

    for (const destroyedImage of images.destroyedImages) {
      await restoreCloudinary(destroyedImage)
    }
    
    await rollbackTransaction()
    next(err)
  }
}
