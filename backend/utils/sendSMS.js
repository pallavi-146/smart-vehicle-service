const client = require('../config/twilioConfig');

const sendSMS = async (to, message) => {
    try {
        const response = await client.messages.create({
            body: message,
            to: to,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        console.log(`SMS sent: ${response.sid}`);
        return true;
    } catch (error) {
        console.error('SMS error:', error);
        return false;
    }
};

module.exports = sendSMS;