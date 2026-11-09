const brevo = require('@getbrevo/brevo');

const sendEmail = async (to, subject, text) => {
    console.log('📧 Attempting to send email via Brevo to:', to);
    
    try {
        // Initialize Brevo API client
        const apiInstance = new brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.textContent = text;
        sendSmtpEmail.sender = { email: "pallavi14062@gmail.com", name: "Smart Vehicle Service" };
        sendSmtpEmail.to = [{ email: to }];

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Email sent successfully via Brevo!');
        return true;
    } catch (error) {
        console.error('❌ Brevo Email failed:', error.message);
        return false;
    }
};

module.exports = sendEmail;