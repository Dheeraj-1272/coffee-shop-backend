const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
require('dotenv').config();
console.log("🛠 MONGO_URI:", process.env.MONGO_URI);

const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: 'https://coffee-shop-frontend-7qpqcdiia-dheeraj-1272s-projects.vercel.app', // Allow only your frontend
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle Preflight (OPTIONS) Requests for CORS



// Connect to MongoDB with error handling
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

// Define Order Schema
const orderSchema = new mongoose.Schema({
  items: [{ name: String, price: Number, quantity: Number }],
  total: Number,
  customerName: String,
  customerPhone: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// Twilio Setup


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);
const twilioPhone = "+18109015270"; // Your Twilio Verified Phone Number
const recipientPhone = "+918096678362"; // Your Personal Number

// API to Create an Order
app.post('/create-order', async (req, res) => {
  try {
    const { items, total, customerName, customerPhone } = req.body;

    console.log("📩 Received Order Request:", req.body);

    // Validate required fields
    if (!items || !total || !customerName || !customerPhone) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // Save order in MongoDB
    const order = new Order({ items, total, customerName, customerPhone });
    await order.save();
    console.log("✅ Order saved in MongoDB");

    // Send SMS Notification
    const message = `New Order!\nCustomer: ${customerName}\nPhone: ${customerPhone}\nTotal: ₹${total}\nItems: ${items.map(item => `${item.name} (${item.quantity})`).join(', ')}`;

    client.messages.create({
      body: message,
      from: twilioPhone,
      to: recipientPhone,
    }).then(() => {
      console.log("✅ SMS sent successfully");
    }).catch(err => {
      console.error("❌ Failed to send SMS:", err);
    });

    res.json({ success: true, order });

  } catch (error) {
    console.error("❌ Error processing order:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// API to Fetch All Orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ Failed to fetch orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// Basic Route
app.get('/', (req, res) => {
  res.send("Welcome to Dheeraj's Coffee Shop Backend!");
});
