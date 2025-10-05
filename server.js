// Node.js Express server for basic Stripe Payment Intent testing (No Webhooks)
const express = require('express');
const path = require('path');

const STRIPE_SECRET_KEY = 'sk_test_51QDrhGCix17DoyQvJ23DvLegW6CJq2NAESd7twc2uZFPWMR1EHebewIChJw9c1yny7MwJKZiZQkwQVmRnq8yAEr6004c6rzHAD'; // <--- PASTE YOUR TEST SECRET KEY HERE
const PORT = 4242;

// Initialize Stripe with the secret key
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const app = express();

// Middleware for serving the static HTML file from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// --- 1. Endpoint to create a PaymentIntent ---
// We use express.json() to parse incoming JSON bodies (though none are expected in this simple example)
app.post('/create-payment-intent', express.json(), async (req, res) => {
    try {
        // Hardcode the amount for a simple test ($20.00 USD)
        const amountInCents = 2000; 
        
        console.log(`Attempting to create PaymentIntent for $${amountInCents / 100}...`);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
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

// Start the server
app.listen(PORT, () => console.log(`🚀 Stripe Test server running on http://localhost:${PORT}`));
console.log('NOTE: Webhooks are disabled in this simplified test. For production, webhooks are required.');
