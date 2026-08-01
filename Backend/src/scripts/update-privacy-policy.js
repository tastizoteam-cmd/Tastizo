import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FoodPageContent } from '../modules/food/admin/models/pageContent.model.js';

dotenv.config();

const DEFAULT_PRIVACY = `
<h2><strong>1. Introduction</strong></h2>
<p>Tastizo ("we", "our", "us") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application (collectively, the "Platform").</p>
<h2><strong>2. Information We Collect</strong></h2>
<p>We may collect the following types of information:</p>
<ul>
  <li><strong>Personal Information:</strong> Name, email address, phone number, delivery address, date of birth, and gender when you create an account or place an order.</li>
  <li><strong>Payment Information:</strong> Payment method details are processed securely through our payment gateway partners (e.g., Razorpay). We do not store your full card details on our servers.</li>
  <li><strong>Location Data (Including Background Location for Delivery Partners):</strong> We collect real-time location data to provide accurate delivery services and show nearby restaurants. For the Tastizo Delivery Partner App, we collect location data to enable delivery tracking, assign nearby orders, and calculate distance traveled <strong>even when the app is closed or not in use</strong>. This is essential for the core functionality of our delivery service.</li>
  <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers, and mobile network information.</li>
  <li><strong>Usage Data:</strong> Pages visited, features used, search queries, order history, and interaction patterns.</li>
</ul>
<h2><strong>3. How We Use Your Information</strong></h2>
<ul>
  <li>To process and deliver your food orders.</li>
  <li>To communicate order updates, promotions, and customer support.</li>
  <li>To improve our Platform, services, and user experience.</li>
  <li>To detect and prevent fraud and ensure platform security.</li>
  <li>To comply with legal obligations.</li>
</ul>
<h2><strong>4. Information Sharing</strong></h2>
<p>We may share your information with:</p>
<ul>
  <li><strong>Restaurant Partners:</strong> To fulfill your orders.</li>
  <li><strong>Delivery Partners:</strong> To deliver your orders to your specified address.</li>
  <li><strong>Payment Processors:</strong> To process payments securely.</li>
  <li><strong>Service Providers:</strong> Third-party vendors who assist with analytics, notifications, and customer support.</li>
</ul>
<p>We do not sell your personal information to third parties.</p>
<h2><strong>5. Data Security</strong></h2>
<p>We implement industry-standard security measures including encryption, secure servers, and access controls to protect your personal information.</p>
<h2><strong>6. Your Rights</strong></h2>
<p>You have the right to access, correct, or delete your personal data. You may also request data portability or restrict processing. To exercise these rights, contact us at <strong>support@tastizo.com</strong>.</p>
<h2><strong>7. Data Retention</strong></h2>
<p>We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your account and data at any time.</p>
<h2><strong>8. Contact Us</strong></h2>
<p>If you have questions about this Privacy Policy, please contact us at <strong>support@tastizo.com</strong>.</p>
`;

async function updatePrivacyPolicy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await FoodPageContent.findOneAndUpdate(
      { key: 'privacy_policy' },
      { content: DEFAULT_PRIVACY },
      { new: true }
    );

    if (result) {
      console.log('Privacy Policy successfully updated to include background location disclosure.');
    } else {
      console.log('Privacy Policy not found. Please run seed-page-contents.js first.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating privacy policy:', error);
    process.exit(1);
  }
}

updatePrivacyPolicy();
