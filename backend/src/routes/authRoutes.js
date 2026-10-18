import express from 'express'
import { Router } from 'express'
import { googleAuth } from '../services/userService/googleAuth.js'


const router = express.Router()

router.post("/google", googleAuth)


export default router