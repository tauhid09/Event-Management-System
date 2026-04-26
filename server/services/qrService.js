const QRCode = require('qrcode');
const crypto = require('crypto');

const generateBookingQR = async (bookingId) => {
  const hmac = crypto.createHmac('sha256', process.env.JWT_SECRET);
  hmac.update(bookingId.toString());
  const signature = hmac.digest('hex');
  const qrData = JSON.stringify({ bookingId: bookingId.toString(), sig: signature });
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    width: 300, margin: 2,
    color: { dark: '#6C5CE7', light: '#161121' },
  });
  return qrCodeDataUrl;
};

const verifyBookingQR = (bookingId, signature) => {
  const hmac = crypto.createHmac('sha256', process.env.JWT_SECRET);
  hmac.update(bookingId);
  const expectedSig = hmac.digest('hex');
  return signature === expectedSig;
};

module.exports = { generateBookingQR, verifyBookingQR };
