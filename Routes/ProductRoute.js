import express from 'express'
import { Create, listProduct, deleteProduct, updateProduct, singleProductInfo } from '../Controllers/ProductController.js'
import protect from '../middleware/authMiddleware.js'
import multer from 'multer'

const router = express.Router()

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

// Routes
router.post('/create-product', protect, upload.single('image'), Create)
router.get('/list-products', listProduct)
router.delete('/delete-product/:id', protect, deleteProduct)
router.put('/update-product/:id', protect, upload.single('image'), updateProduct)
router.get('/product/:id', singleProductInfo)

export default router