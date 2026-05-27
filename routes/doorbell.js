const express = require('express')
const router = express.Router()
const { devices, sessions, users } = require('../utils/db')
const { sendDoorbellNotificationEmail } = require('../utils/email')
const authMiddleware = require('../middleware/auth')
const { v4: uuidv4 } = require('uuid')
router.post('/ring', async (req, res) => {
  try {
    const { deviceId, deviceSecret } = req.body
    const device = devices.get(deviceId)
    if (!device || device.secret !== deviceSecret) return res.json({ resultCode: 1, message: 'Invalid device' })
    const sessionId = uuidv4()
    sessions.set(sessionId, { sessionId, deviceId, deviceName: device.name, userId: device.userId, status: 'ringing', createdAt: Date.now() })
    const owner = users.get(device.userId)
    if (owner) await sendDoorbellNotificationEmail(owner.email, device.name)
    return res.json({ resultCode: 0, message: 'Ring registered', data: { sessionId } })
  } catch (e) { return res.json({ resultCode: 1, message: 'Server error' }) }
})
router.post('/register-device', authMiddleware, (req, res) => {
  const { deviceName, bluetoothId } = req.body
  const secret = uuidv4().replace(/-/g, '').substring(0, 16)
  const deviceId = uuidv4()
  const device = { deviceId, name: deviceName || 'My digitalGONG', bluetoothId, userId: req.user.userid, secret }
  devices.set(deviceId, device)
  return res.json({ resultCode: 0, message: 'Device registered', data: { deviceId, deviceSecret: secret, deviceName: device.name } })
})
router.get('/my-devices', authMiddleware, (req, res) => {
  const list = Array.from(devices.values()).filter(d => d.userId === req.user.userid).map(({ secret: _, ...d }) => d)
  return res.json({ resultCode: 0, data: list })
})
router.get('/sessions', authMiddleware, (req, res) => {
  const ids = Array.from(devices.values()).filter(d => d.userId === req.user.userid).map(d => d.deviceId)
  const list = Array.from(sessions.values()).filter(s => ids.includes(s.deviceId)).sort((a, b) => b.createdAt - a.createdAt).slice(0, 20)
  return res.json({ resultCode: 0, data: list })
})
router.post('/update-display', authMiddleware, (req, res) => {
  const { deviceId, displayName, subText } = req.body
  const device = devices.get(deviceId)
  if (!device || device.userId !== req.user.userid) return res.json({ resultCode: 1, message: 'Device not found' })
  device.displayName = displayName
  device.subText = subText
  devices.set(deviceId, device)
  return res.json({ resultCode: 0, message: 'Display updated', data: { displayName, subText } })
})
router.get('/display/:deviceId', (req, res) => {
  const device = devices.get(req.params.deviceId)
  if (!device) return res.json({ resultCode: 1, message: 'Not found' })
  return res.json({ resultCode: 0, data: { displayName: device.displayName || 'digitalGONG', subText: device.subText || '' } })
})
module.exports = router
