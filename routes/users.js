const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const { users, otpCodes } = require('../utils/db')
const { sendOtpEmail } = require('../utils/email')
const authMiddleware = require('../middleware/auth')
const JWT_SECRET = process.env.JWT_SECRET || 'digitalgong_secret_2024'
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString()
router.post('/account-setup', async (req, res) => {
  try {
    const { fullName, userName, email, password, userType } = req.body
    if (!fullName || !email || !password) return res.json({ resultCode: 1, message: 'All fields required' })
    const existing = Array.from(users.values()).find(u => u.email === email.toLowerCase())
    if (existing) return res.json({ resultCode: 1, message: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 10)
    const userId = uuidv4()
    const newUser = { userid: userId, fullName, userName, email: email.toLowerCase(), password: hashed, userType: userType || 'PRIVATE', isVerified: false }
    users.set(userId, newUser)
    const otp = generateOTP()
    otpCodes.set(email.toLowerCase(), { otp, expiresAt: Date.now() + 600000, userId })
    console.log('OTP for ' + email + ': ' + otp)
    await sendOtpEmail(email, otp)
    const token = jwt.sign({ userid: userId, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ resultCode: 0, message: 'Registration successful. OTP sent.', data: { userid: userId, fullName, userName, email: newUser.email, userType: newUser.userType, token } })
  } catch (e) { return res.json({ resultCode: 1, message: 'Server error' }) }
})
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = Array.from(users.values()).find(u => u.email === email?.toLowerCase())
    if (!user) return res.json({ resultCode: 1, message: 'User not found' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.json({ resultCode: 1, message: 'Invalid credentials' })
    const token = jwt.sign({ userid: user.userid, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ resultCode: 0, message: 'Login successful', data: { userid: user.userid, fullName: user.fullName, userName: user.userName, email: user.email, userType: user.userType, token } })
  } catch (e) { return res.json({ resultCode: 1, message: 'Server error' }) }
})
router.post('/user_data', authMiddleware, (req, res) => {
  const user = users.get(req.user.userid)
  if (!user) return res.json({ resultCode: 1, message: 'Not found' })
  const { password: _, ...safe } = user
  return res.json({ resultCode: 0, data: safe })
})
router.post('/forgotPassword', async (req, res) => {
  const { email } = req.body
  const user = Array.from(users.values()).find(u => u.email === email?.toLowerCase())
  if (!user) return res.json({ resultCode: 1, message: 'Email not found' })
  const otp = generateOTP()
  otpCodes.set(email.toLowerCase(), { otp, expiresAt: Date.now() + 600000, userId: user.userid })
  console.log('Reset OTP for ' + email + ': ' + otp)
  await sendOtpEmail(email, otp)
  return res.json({ resultCode: 0, message: 'OTP sent' })
})
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body
  const stored = otpCodes.get(email?.toLowerCase())
  if (!stored || Date.now() > stored.expiresAt) return res.json({ resultCode: 1, message: 'OTP expired' })
  if (stored.otp !== otp) return res.json({ resultCode: 1, message: 'Invalid OTP' })
  otpCodes.delete(email.toLowerCase())
  return res.json({ resultCode: 0, message: 'OTP verified' })
})
router.post('/resetPassword', async (req, res) => {
  const { email, newPassword } = req.body
  const user = Array.from(users.values()).find(u => u.email === email?.toLowerCase())
  if (!user) return res.json({ resultCode: 1, message: 'User not found' })
  user.password = await bcrypt.hash(newPassword, 10)
  users.set(user.userid, user)
  return res.json({ resultCode: 0, message: 'Password reset successful' })
})
router.post('/updateProfile', authMiddleware, (req, res) => {
  const user = users.get(req.user.userid)
  if (!user) return res.json({ resultCode: 1, message: 'Not found' })
  if (req.body.fullName) user.fullName = req.body.fullName
  if (req.body.userName) user.userName = req.body.userName
  users.set(user.userid, user)
  const { password: _, ...safe } = user
  return res.json({ resultCode: 0, data: safe })
})
router.post('/Logout', authMiddleware, (req, res) => res.json({ resultCode: 0, message: 'Logged out' }))
router.post('/RefreshToken', (req, res) => {
  try {
    const decoded = jwt.verify(req.body.token, JWT_SECRET)
    const token = jwt.sign({ userid: decoded.userid, email: decoded.email }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ resultCode: 0, data: { token } })
  } catch { return res.json({ resultCode: 2, message: 'Invalid token' }) }
})
router.post('/process_user_input', authMiddleware, (req, res) => res.json({ resultCode: 0, message: 'Updated' }))
router.post('/invite_user', authMiddleware, (req, res) => res.json({ resultCode: 0, message: 'Invited' }))
router.post('/family_members', authMiddleware, (req, res) => res.json({ resultCode: 0, data: [] }))
router.post('/remove_user', authMiddleware, (req, res) => res.json({ resultCode: 0, message: 'Removed' }))
router.post('/update_billing', authMiddleware, (req, res) => res.json({ resultCode: 0, message: 'Updated' }))
router.post('/invitation_accept_reject', authMiddleware, (req, res) => res.json({ resultCode: 0, message: 'Updated' }))
module.exports = router
