// Node.js Express server for Stripe Payment Processing - LIVE MODE
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Stripe Live Configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY; // Live secret key from environment
const PORT = process.env.PORT || 4242;

// Validate required environment variables
if (!STRIPE_SECRET_KEY || !STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    console.error('❌ ERROR: Live Stripe secret key is required. Please set STRIPE_SECRET_KEY in .env file.');
    process.exit(1);
}

// Email Configuration
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Initialize Stripe with the secret key
const stripe = require('stripe')(STRIPE_SECRET_KEY);

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: EMAIL_CONFIG.service,
    auth: EMAIL_CONFIG.auth
});

// Beautiful HTML Email Template Function - Table-based Layout for Admin
function generateEmailTemplate(formData, paymentInfo) {
    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Format form data for display
    const applicantInfo = {
        name: formData['full-name'] || 'Not Provided',
        gender: formData.gender || 'Not Specified',
        nationality: formData.selectedCountry ? formData.selectedCountry.name : 'Not Specified',
        dateOfBirth: formData['dob-month'] && formData['dob-day'] && formData['dob-year'] 
            ? `${formData['dob-month']}/${formData['dob-day']}/${formData['dob-year']}` 
            : 'Not Provided',
        applicationType: formData['application-type'] || 'Not Specified',
        maritalStatus: formData.married === 'yes' ? 'Married' : 'Single',
        email: formData.email || 'Not Provided',
        phone: formData.selectedCountry && formData.phone 
            ? `${formData.selectedCountry.code} ${formData.phone}` 
            : formData.phone || 'Not Provided',
        highSchool: formData['high-school'] === 'yes' ? 'Yes' : 'No',
        furtherEducation: formData['high-school'] === 'no' ? 'N/A (No High School)' : (formData['further-education'] === 'yes' ? 'Yes' : 'No'),
        educationLevel: formData['education-level'] || (formData['high-school'] === 'no' ? 'No High School Diploma' : 'Not Specified'),
        englishLevel: formData['english-level'] || 'Not Specified',
        otherLanguage: formData['other-language'] || 'None',
        otherLanguageLevel: formData['other-language-level'] || 'N/A',
        employmentStatus: getEmploymentStatusText(formData['employment-status']),
        yearsWorked: formData['years-worked'] || 'Not Specified',
        jobTitle: formData['job-title'] || 'Not Specified',
        income: formData.income || 'Not Specified',
        visaType: getVisaTypeText(formData['visa-type']),
        interestedCountries: formatInterestedCountries(formData['interested-countries'])
    };

    // Helper function to format employment status
    function getEmploymentStatusText(status) {
        switch(status) {
            case 'yes': return 'Employed';
            case 'no': return 'Unemployed';
            case 'no-experience': return 'No Previous Experience';
            default: return 'Not Specified';
        }
    }

    // Helper function to format visa type
    function getVisaTypeText(type) {
        switch(type) {
            case 'visit-visa': return 'Visit Visa';
            case 'study-visa': return 'Study Visa';
            case 'work-permit': return 'Work Permit';
            case 'permanent-residence': return 'Permanent Residence';
            case 'business-visa': return 'Business Visa';
            case 'family-sponsorship': return 'Family Sponsorship';
            default: return 'Not Specified';
        }
    }

    // Helper function to format interested countries
    function formatInterestedCountries(countriesString) {
        if (!countriesString) return 'None Selected';
        
        // Define country mapping (subset of the most common countries)
        const countryNames = {
            'au': 'Australia', 'ca': 'Canada', 'us': 'United States', 'gb': 'United Kingdom',
            'de': 'Germany', 'fr': 'France', 'it': 'Italy', 'es': 'Spain', 'nl': 'Netherlands',
            'be': 'Belgium', 'ch': 'Switzerland', 'at': 'Austria', 'se': 'Sweden', 'no': 'Norway',
            'dk': 'Denmark', 'fi': 'Finland', 'ie': 'Ireland', 'nz': 'New Zealand', 'sg': 'Singapore',
            'hk': 'Hong Kong', 'jp': 'Japan', 'kr': 'South Korea', 'ae': 'United Arab Emirates',
            'in': 'India', 'pk': 'Pakistan', 'bd': 'Bangladesh', 'lk': 'Sri Lanka', 'sa': 'Saudi Arabia',
            'za': 'South Africa', 'ng': 'Nigeria', 'eg': 'Egypt', 'ma': 'Morocco', 'br': 'Brazil',
            'ar': 'Argentina', 'cl': 'Chile', 'mx': 'Mexico', 'cn': 'China', 'ru': 'Russia'
        };
        
        const countryCodes = countriesString.split(',').filter(code => code.trim());
        const countryNamesList = countryCodes.map(code => 
            countryNames[code.trim()] || code.trim().toUpperCase()
        );
        
        return countryNamesList.join(', ');
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Visa Application - Payment Confirmed</title>
        <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background-color: #e63946; color: white; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
            .status-badge { background-color: #059669; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; font-size: 12px; }
            .content { padding: 20px; }
            .payment-section { background-color: #e8f5e8; border: 1px solid #059669; border-radius: 6px; padding: 15px; margin-bottom: 20px; text-align: center; }
            .payment-amount { font-size: 28px; font-weight: bold; color: #059669; margin: 8px 0; }
            .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; }
            .data-table th { background-color: #f8f9fa; padding: 8px 12px; text-align: left; border: 1px solid #dee2e6; font-weight: bold; color: #495057; }
            .data-table td { padding: 8px 12px; border: 1px solid #dee2e6; color: #6c757d; }
            .data-table tr:nth-child(even) { background-color: #f8f9fa; }
            .section-title { color: #e63946; font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #e63946; }
            .action-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .action-title { color: #856404; font-weight: bold; margin-bottom: 8px; }
            .action-list { color: #856404; margin: 0; padding-left: 20px; }
            .footer { background-color: #343a40; color: #ffffff; padding: 15px; text-align: center; }
            .footer p { margin: 3px 0; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1>🎉 New Visa Application Received</h1>
                <p>Payment Successfully Processed</p>
                <div class="status-badge">✅ PAYMENT CONFIRMED</div>
            </div>

            <!-- Content -->
            <div class="content">
                <!-- Payment Information -->
                <div class="payment-section">
                    <p style="margin: 0; font-size: 16px; color: #495057;">Visa Application Processing Fee</p>
                    <div class="payment-amount">$${(paymentInfo.amount / 100).toFixed(2)}</div>
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">Payment ID: ${paymentInfo.id} | Processed: ${currentDate}</p>
                </div>

                <!-- Personal Information -->
                <div class="section-title">👤 Personal Information</div>
                <table class="data-table">
                    <tr><th>Full Name</th><td>${applicantInfo.name}</td></tr>
                    <tr><th>Gender</th><td>${applicantInfo.gender}</td></tr>
                    <tr><th>Nationality</th><td>${applicantInfo.nationality}</td></tr>
                    <tr><th>Date of Birth</th><td>${applicantInfo.dateOfBirth}</td></tr>
                    <tr><th>Application Type</th><td>${applicantInfo.applicationType}</td></tr>
                    <tr><th>Marital Status</th><td>${applicantInfo.maritalStatus}</td></tr>
                </table>

                <!-- Contact Information -->
                <div class="section-title">📞 Contact Information</div>
                <table class="data-table">
                    <tr><th>Email Address</th><td>${applicantInfo.email}</td></tr>
                    <tr><th>Phone Number</th><td>${applicantInfo.phone}</td></tr>
                </table>

                <!-- Education Background -->
                <div class="section-title">🎓 Education Background</div>
                <table class="data-table">
                    <tr><th>High School Graduate</th><td>${applicantInfo.highSchool}</td></tr>
                    <tr><th>Further Education</th><td>${applicantInfo.furtherEducation}</td></tr>
                    <tr><th>Highest Education Level</th><td>${applicantInfo.educationLevel}</td></tr>
                </table>

                <!-- Language Skills -->
                <div class="section-title">🗣️ Language Skills</div>
                <table class="data-table">
                    <tr><th>English Proficiency</th><td>${applicantInfo.englishLevel}</td></tr>
                    <tr><th>Other Language</th><td>${applicantInfo.otherLanguage}</td></tr>
                    <tr><th>Other Language Level</th><td>${applicantInfo.otherLanguageLevel}</td></tr>
                </table>

                <!-- Employment Information -->
                <div class="section-title">💼 Employment Information</div>
                <table class="data-table">
                    <tr><th>Employment Status</th><td>${applicantInfo.employmentStatus}</td></tr>
                    <tr><th>Years of Experience</th><td>${applicantInfo.yearsWorked}</td></tr>
                    <tr><th>Job Title</th><td>${applicantInfo.jobTitle}</td></tr>
                    <tr><th>Annual Income</th><td>${applicantInfo.income}</td></tr>
                </table>

                <!-- Visa & Destination Preferences -->
                <div class="section-title">🌍 Visa & Destination Preferences</div>
                <table class="data-table">
                    <tr><th>Application Type</th><td>${applicantInfo.visaType}</td></tr>
                    <tr><th>Interested Countries</th><td>${applicantInfo.interestedCountries}</td></tr>
                </table>

                <!-- Next Steps -->
                <div class="action-box">
                    <div class="action-title">📋 Action Required - Next Steps</div>
                    <ol class="action-list">
                        <li>Review all application details above</li>
                        <li>Contact the applicant within 24 hours</li>
                        <li>Schedule consultation if needed</li>
                        <li>Proceed with visa application processing</li>
                    </ol>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p><strong>Global Leaders Visa Services</strong></p>
                <p>This is an automated notification. Please do not reply to this email.</p>
                <p>Generated on ${currentDate}</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Beautiful Applicant Confirmation Email Template - Clean & Minimal Design
function generateApplicantEmailTemplate(formData, paymentInfo) {
    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const applicantName = formData['full-name'] || 'Valued Applicant';
    const nationality = formData.selectedCountry ? formData.selectedCountry.name : 'Not Specified';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Confirmed - Global Leaders</title>
        <style>
            body { margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1f2937, #374151); color: white; padding: 30px 20px; text-align: center; }
            .logo { font-size: 24px; font-weight: 700; color: #f59e0b; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 8px 0 0 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 30px 20px; }
            .status-badge { background-color: #059669; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600; display: inline-block; margin: 15px 0; font-size: 14px; }
            .message-section { text-align: center; margin-bottom: 30px; }
            .greeting { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 15px; }
            .description { color: #6b7280; font-size: 16px; line-height: 1.5; }
            .details-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #374151; }
            .detail-value { color: #6b7280; }
            .next-steps { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .contact-section { text-align: center; background-color: #f9fafb; padding: 20px; margin: 20px -20px 0 -20px; }
            .footer { background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; margin: 30px -20px 0 -20px; }
            @media (max-width: 600px) { .detail-row { flex-direction: column; } .detail-value { margin-top: 4px; } }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo">GLOBAL LEADERS</div>
                <h1>Application Confirmed</h1>
                <p>Your visa application has been successfully received</p>
                <div class="status-badge">✓ PAYMENT CONFIRMED</div>
            </div>

            <!-- Content -->
            <div class="content">
                <!-- Main Message -->
                <div class="message-section">
                    <div class="greeting">Hey ${applicantName},</div>
                    <div class="description">
                        We've received your visa application and payment. Our team will now review your submission and contact you within 24 hours with next steps.
                    </div>
                </div>

                <!-- Application Details -->
                <div class="details-box">
                    <div class="detail-row">
                        <span class="detail-label">Transaction ID:</span>
                        <span class="detail-value">${paymentInfo.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount Paid:</span>
                        <span class="detail-value">$${(paymentInfo.amount / 100).toFixed(2)} USD</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Application Type:</span>
                        <span class="detail-value">${formData['application-type'] || 'Standard'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Visa Type:</span>
                        <span class="detail-value">${getVisaTypeText(formData['visa-type'])}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Interested Countries:</span>
                        <span class="detail-value">${formatInterestedCountries(formData['interested-countries'])}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Nationality:</span>
                        <span class="detail-value">${nationality}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date Submitted:</span>
                        <span class="detail-value">${currentDate}</span>
                    </div>
                </div>

                <!-- Next Steps -->
                <div class="next-steps">
                    <strong>Important:</strong> Please keep this email for your records. Do not change any account passwords or settings until your application is processed, typically within 8-12 hours.
                </div>

                <!-- Contact Section -->
                <div class="contact-section">
                    <strong>Need Help?</strong><br>
                    Email: support@globalleaders.com<br>
                    Phone: +1 (682) 444-4504
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>© 2025 Global Leaders. All rights reserved.</p>
                <p style="font-size: 12px; margin-top: 10px;">Generated on ${currentDate}</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Email sending function for admin notification
async function sendAdminNotification(formData, paymentInfo) {
    try {
        const emailHtml = generateEmailTemplate(formData, paymentInfo);
        
        const mailOptions = {
            from: `"Global Leaders" <${EMAIL_CONFIG.auth.user}>`,
            to: ADMIN_EMAIL,
            subject: `🎉 New Visa Application - Payment Confirmed ($${(paymentInfo.amount / 100).toFixed(2)})`,
            html: emailHtml
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Admin notification email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending admin notification email:', error);
        return { success: false, error: error.message };
    }
}

// Email sending function for applicant confirmation
async function sendApplicantConfirmation(formData, paymentInfo) {
    try {
        const emailHtml = generateApplicantEmailTemplate(formData, paymentInfo);
        const applicantEmail = formData.email;
        
        if (!applicantEmail) {
            throw new Error('Applicant email address not provided');
        }

        const mailOptions = {
            from: `"Global Leaders" <${EMAIL_CONFIG.auth.user}>`,
            to: applicantEmail,
            subject: `✅ Visa Application Confirmed - Global Leaders (Transaction: ${paymentInfo.id})`,
            html: emailHtml
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Applicant confirmation email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending applicant confirmation email:', error);
        return { success: false, error: error.message };
    }
}

const app = express();

// Enable CORS for all routes to allow cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Middleware for serving the static HTML file from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// --- 1. Endpoint to create a PaymentIntent ---
// We use express.json() to parse incoming JSON bodies
app.post('/create-payment-intent', express.json(), async (req, res) => {
    try {
        // Get amount and essential data from request body
        const { amount = 5000, essentialData } = req.body; // amount in cents (default $50.00)
        
        console.log(`Creating PaymentIntent for $${amount / 100} - Visa Application Processing Fee`);
        if (essentialData) {
            console.log('Essential data received:', essentialData);
        }

        // Create very compact metadata with only essential info
        const compactMetadata = {
            service: 'visa_app',
            name: (essentialData?.name || 'Unknown').substring(0, 30),
            email: (essentialData?.email || 'Unknown').substring(0, 40),
            visa: (essentialData?.visaType || 'Unknown').substring(0, 15),
            country: (essentialData?.nationality || 'Unknown').substring(0, 20)
        };

        // Debug: Check metadata size
        const metadataString = JSON.stringify(compactMetadata);
        console.log('Metadata size:', metadataString.length, 'characters');
        console.log('Metadata content:', metadataString);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            description: 'Global Leaders Visa Application Processing Fee',
            metadata: compactMetadata,
            // Stripe enables dynamic payment methods by default
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Send the client secret back to the client
        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
            message: 'Payment Intent created successfully.'
        });

    } catch (error) {
        console.error('Error creating Payment Intent:', error.message);
        res.status(500).send({ error: error.message });
    }
});

// --- 2. Endpoint to send email notification after successful payment ---
app.post('/send-payment-notification', express.json(), async (req, res) => {
    try {
        const { paymentIntentId, formData } = req.body;
        
        if (!paymentIntentId || !formData) {
            return res.status(400).send({ error: 'Payment Intent ID and form data are required' });
        }

        // Verify the payment was actually successful by retrieving it from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            console.log('💰 Payment confirmed as successful, sending email notifications...');
            
            // Send both admin notification and applicant confirmation emails
            const emailResults = await Promise.allSettled([
                sendAdminNotification(formData, {
                    id: paymentIntent.id,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency
                }),
                sendApplicantConfirmation(formData, {
                    id: paymentIntent.id,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency
                })
            ]);

            // Check results
            const adminResult = emailResults[0];
            const applicantResult = emailResults[1];
            
            let successMessage = 'Email notifications processed: ';
            let hasErrors = false;

            if (adminResult.status === 'fulfilled' && adminResult.value.success) {
                console.log('📧 Admin notification sent successfully');
                successMessage += 'Admin ✅ ';
            } else {
                console.error('📧 Failed to send admin notification:', adminResult.reason || adminResult.value?.error);
                successMessage += 'Admin ❌ ';
                hasErrors = true;
            }

            if (applicantResult.status === 'fulfilled' && applicantResult.value.success) {
                console.log('📧 Applicant confirmation sent successfully');
                successMessage += 'Applicant ✅';
            } else {
                console.error('📧 Failed to send applicant confirmation:', applicantResult.reason || applicantResult.value?.error);
                successMessage += 'Applicant ❌';
                hasErrors = true;
            }

            if (!hasErrors) {
                res.status(200).send({ 
                    message: 'Both email notifications sent successfully',
                    adminMessageId: adminResult.value?.messageId,
                    applicantMessageId: applicantResult.value?.messageId
                });
            } else {
                res.status(207).send({ // 207 Multi-Status
                    message: successMessage,
                    adminResult: adminResult.status === 'fulfilled' ? adminResult.value : { success: false, error: adminResult.reason },
                    applicantResult: applicantResult.status === 'fulfilled' ? applicantResult.value : { success: false, error: applicantResult.reason }
                });
            }
        } else {
            console.log('❌ Payment not successful, status:', paymentIntent.status);
            res.status(400).send({ error: 'Payment was not successful' });
        }

    } catch (error) {
        console.error('Error in payment notification:', error.message);
        res.status(500).send({ error: error.message });
    }
});

// --- 2. Webhook endpoint for payment success notifications ---
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // In production, verify the webhook signature for security
        // For now, we'll parse the event directly
        event = JSON.parse(req.body);
    } catch (err) {
        console.log('❌ Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log('💰 Payment succeeded!', paymentIntent.id);
        
        // Create basic form data from metadata for email notification
        const formData = {
            'full-name': paymentIntent.metadata.name || 'Unknown',
            'email': paymentIntent.metadata.email || 'Unknown',
            'visa-type': paymentIntent.metadata.visa || 'Unknown',
            'selectedCountry': { name: paymentIntent.metadata.country || 'Unknown' }
        };
        
        console.log('📋 Using basic form data from metadata for webhook notification');
        
        // Send admin notification email
        const emailResult = await sendAdminNotification(formData, {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
        });
        
        if (emailResult.success) {
            console.log('📧 Admin notification sent successfully');
        } else {
            console.error('📧 Failed to send admin notification:', emailResult.error);
        }
    }

    res.json({received: true});
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Global Leaders Visa Application Server running on http://localhost:${PORT}`);
    console.log(`🔒 Running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`💳 Stripe Live Mode: ${STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'ENABLED' : 'DISABLED'}`);
});