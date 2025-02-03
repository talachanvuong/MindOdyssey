import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '../db/db.js'
import {
  destroyCloudinary,
  restoreCloudinary,
} from '../services/cloudinaryService.js'

export const uploadTransactionHandler = (fn) => async (req, res, next) => {
  // For cloudinary
  const uploadedImages = []

  try {
    await startTransaction()
    await fn(uploadedImages, req, res, next)
    await commitTransaction()
  } catch (err) {
    for (const uploadedImage of uploadedImages) {
      await destroyCloudinary(uploadedImage)
    }

    await rollbackTransaction()
    next(err)
  }
}

export const destroyTransactionHandler = (fn) => async (req, res, next) => {
  // For cloudinary
  const destroyedImages = []

  try {
    await startTransaction()
    await fn(destroyedImages, req, res, next)
    await commitTransaction()
  } catch (err) {
    for (const destroyedImage of destroyedImages) {
      await restoreCloudinary(destroyedImage)
    }

    await rollbackTransaction()
    next(err)
  }
}
