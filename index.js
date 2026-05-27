const express = require('express')
const cors = require('cors')
require('dotenv').config()
const userRoutes = require('./routes/users')
const doorbellRoutes = require('./routes/doorbell')
const app = express()
const PORT = process.env.PORT || 4000
app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
  res.json({ status: 'digitalGONG Server running', version: '1.0.0' })
})
app.use('/api/users', userRoutes)
app.use('/api/doorbell', doorbellRoutes)
app.listen(PORT, () => {
  console.log(`digitalGONG Server running on port ${PORT}`)
})
module.exports = app
