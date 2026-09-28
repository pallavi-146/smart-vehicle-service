const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const sendEmail = require('./utils/sendEmail');

async function test() {
    console.log('Testing email...');
    console.log('Email user:', process.env.EMAIL_USER);
    console.log('Email pass set:', process.env.EMAIL_PASS ? 'Yes' : 'No');
    
    const result = await sendEmail('pallavia40929@gmail.com', 'Test Email', 'If you receive this, your email is working!');
    console.log('Result:', result ? '✅ Success' : '❌ Failed');
}

test();