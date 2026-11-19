import express from 'express'
import { handleBotQuery, getAllHelpGuides } from '../controllers/botController.js'

const router = express.Router()

// Assistant Query Endpoint (MongoDB Aggregations + Text Search + Procedures)
router.post('/query', handleBotQuery)

// Get all procedure and help guides
router.get('/guides', getAllHelpGuides)

export default router

