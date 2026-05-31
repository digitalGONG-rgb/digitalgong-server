digitalGONG Server

Backend API für das digitale Türklingel- und Zutrittssystem digitalGONG.

Features

- Benutzerregistrierung
- Login mit JWT Authentication
- OTP-Verifizierung per E-Mail
- Passwort zurücksetzen
- Geräteverwaltung
- Bluetooth-Geräte Registrierung
- Türklingel-Benachrichtigungen per E-Mail
- Session-Verwaltung

Installation

npm install

Umgebungsvariablen

PORT=3000
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password

Starten

npm start

API Endpoints

Benutzer

- POST /api/users/account-setup
- POST /api/users/login
- POST /api/users/user_data
- POST /api/users/forgotPassword
- POST /api/users/verify-otp
- POST /api/users/resetPassword
- POST /api/users/updateProfile

Türklingel

- POST /api/doorbell/ring
- POST /api/doorbell/register-device
- GET /api/doorbell/my-devices
- GET /api/doorbell/sessions
- POST /api/doorbell/update-display
- GET /api/doorbell/display/:deviceId

Version

1.0.0
