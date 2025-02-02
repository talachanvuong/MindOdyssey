import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '../db/db.js'
import { destroyCloudinary } from '../services/cloudinaryService.js'

export const transactionHandler = (fn) => async (req, res, next) => {
  // For cloudinary
  const uploadedImages = []

  try {
    await startTransaction()
    await fn(uploadedImages, req, res, next)
    await commitTransaction()
  } catch (err) {
    for (let i = 0; i < uploadedImages.length; i++) {
      const uploadedImage = uploadedImages[i]
      await destroyCloudinary(uploadedImage)
    }

    await rollbackTransaction()
    next(err)
  }
}
