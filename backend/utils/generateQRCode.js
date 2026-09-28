const QRCode = require('qrcode');

// Generate QR code for UPI payment
const generateQRCode = async (amount, bookingId, upiId = 'vehicle.service@okhdfcbank') => {
    try {
        const payeeName = 'Smart Vehicle Service';
        const note = `Payment for booking ${bookingId}`;
        
        // Create UPI payment string
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
        
        // Generate QR code as Data URL
        const qrCodeUrl = await QRCode.toDataURL(upiString, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 300,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        
        return qrCodeUrl;
    } catch (error) {
        console.error('QR Code generation error:', error);
        return null;
    }
};

// Generate QR code for any custom data
const generateCustomQR = async (data, width = 300) => {
    try {
        const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
        
        const qrCodeUrl = await QRCode.toDataURL(jsonData, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: width,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        
        return qrCodeUrl;
    } catch (error) {
        console.error('Custom QR Code generation error:', error);
        return null;
    }
};

// Generate QR code as buffer (for saving to file)
const generateQRCodeBuffer = async (amount, bookingId) => {
    try {
        const upiId = 'vehicle.service@okhdfcbank';
        const payeeName = 'Smart Vehicle Service';
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;
        
        const buffer = await QRCode.toBuffer(upiString, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 300
        });
        
        return buffer;
    } catch (error) {
        console.error('QR Code buffer generation error:', error);
        return null;
    }
};

// Generate QR code as file
const generateQRCodeFile = async (amount, bookingId, filePath) => {
    try {
        const upiId = 'vehicle.service@okhdfcbank';
        const payeeName = 'Smart Vehicle Service';
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;
        
        await QRCode.toFile(filePath, upiString, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 300
        });
        
        return filePath;
    } catch (error) {
        console.error('QR Code file generation error:', error);
        return null;
    }
};

module.exports = { 
    generateQRCode, 
    generateCustomQR, 
    generateQRCodeBuffer, 
    generateQRCodeFile 
};