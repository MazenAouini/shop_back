import express from 'express'
import { Create } from '../Controllers/ProductController.js'
const router = express.Router()

router.post("/create-product",Create)

export default router