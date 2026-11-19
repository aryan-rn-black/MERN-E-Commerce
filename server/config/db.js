import mongoose from 'mongoose'

let isConnected = false

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopverse'

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    isConnected = true
    console.log(`\x1b[32m✔ MongoDB Connected:\x1b[0m ${conn.connection.host} / ${conn.connection.name}`)
    return conn
  } catch (error) {
    isConnected = false
    console.error(`\x1b[31m✖ MongoDB Connection Error:\x1b[0m ${error.message}`)
    console.log(`\x1b[33mℹ Tip:\x1b[0m Ensure MongoDB is running locally (e.g. 'mongod' or MongoDB Compass) or set MONGODB_URI in server/.env with your MongoDB Atlas connection string.`)
    return null
  }
}

export const getDBStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
})
