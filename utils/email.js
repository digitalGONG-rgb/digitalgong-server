const nodemailer = require('nodemailer')
const sendOtpEmail = async (toEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })
    await transporter.sendMail({
      from: '"digitalGONG" <' + process.env.EMAIL_USER + '>',
      to: toEmail,
      subject: 'digitalGONG - Your OTP Code',
      html: '<div style="font-family:Arial;padding:20px;background:#1a1a4e;color:white;border-radius:12px"><h2>digitalGONG</h2><p>Your OTP code:</p><h1 style="letter-spacing:8px;color:#ff69b4">' + otp + '</h1><p>Expires in 10 minutes.</p></div>'
    })
    console.log('OTP sent to ' + toEmail)
    return true
  } catch (e) {
    console.error('Email error:', e.message)
    return false
  }
}
const sendDoorbellNotificationEmail = async (toEmail, deviceName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })
    await transporter.sendMail({
      from: '"digitalGONG" <' + process.env.EMAIL_USER + '>',
      to: toEmail,
      subject: 'Someone is at your door!',
      html: '<div style="font-family:Arial;padding:20px;background:#1a1a4e;color:white;border-radius:12px"><h2>Someone rang your doorbell!</h2><p>Device: ' + deviceName + '</p><p>Open the digitalGONG app.</p></div>'
    })
    return true
  } catch (e) {
    console.error('Notification error:', e.message)
    return false
  }
}
module.exports = { sendOtpEmail, sendDoorbellNotificationEmail }
