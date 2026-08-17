import { sendApprovalEmail } from './src/utils/email.js';

async function testEmail() {
    console.log('Testing approval email for Restaurant...');
    const result = await sendApprovalEmail('tastizoteam@gmail.com', 'Tastizo Admin', 'Restaurant');
    if (result) {
        console.log('Test email sent successfully to tastizoteam@gmail.com for Restaurant!');
    } else {
        console.log('Failed to send test email.');
    }
    process.exit(0);
}

testEmail().catch(err => {
    console.error('Error during test:', err);
    process.exit(1);
});
