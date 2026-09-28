const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pallavi14062@gmail.com',
        pass: 'sbev vwod yept dnbv'
    }
});

const sendEmail = async (to, subject, text) => {
    console.log('📧 sendEmail called with:', { to, subject });
    
    try {
        const mailOptions = {
            from: 'pallavi14062@gmail.com',
            to: to,
            subject: subject,
            text: text
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully! Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Email failed:', error.message);
        return false;
    }
};

module.exports = sendEmail;