// ---------------- Node.js / Core ----------------
import crypto from "crypto";
// ---------------- Service Configs ----------------
import "../config/firebase.config.js";
import razorpay from "../config/razorpay.config.js";

// ---------------- Models / Associations ----------------
import { User, Donor, Donation } from "../models/associations.js";

// Create Razorpay order (amount in INR)
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys not configured");
      return res.status(500).json({ error: "Razorpay keys not configured" });
    }

    console.log("Creating order for amount:", amount);
    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });
    console.log("Order created:", order.id);
    res.json({ order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res
      .status(500)
      .json({ error: `Failed to create payment order: ${error.message}` });
  }
};
// Verify Razorpay signature
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ error: "Missing payment verification data" });
    }
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const isValid = generatedSignature === razorpay_signature;
    res.json({ valid: isValid });
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};

// Get payment details and bank account info
export const getPaymentDetails = async (req, res) => {
  try {
    const { payment_id } = req.query;

    if (!payment_id) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    // Get donation details
    const donation = await Donation.findOne({
      where: { payment_id },
      include: [
        {
          model: Donor,
          as: "donor",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["fullname", "email"],
            },
          ],
        },
      ],
    });

    if (!donation) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Get Razorpay payment details (if you want to fetch from Razorpay API)
    let razorpayPaymentDetails = null;
    try {
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const payment = await razorpay.payments.fetch(payment_id);
        razorpayPaymentDetails = {
          status: payment.status,
          method: payment.method,
          bank: payment.bank,
          wallet: payment.wallet,
          vpa: payment.vpa,
          email: payment.email,
          contact: payment.contact,
          fee: payment.fee,
          tax: payment.tax,
          created_at: payment.created_at,
        };
      }
    } catch (error) {
      console.error("Error fetching Razorpay payment details:", error);
    }

    res.json({
      donation: {
        donation_id: donation.donation_id,
        amount: donation.amount,
        purpose: donation.purpose,
        date: donation.date,
        payment_status: donation.payment_status,
        transfer_status: donation.transfer_status,
        bank_account: donation.bank_account,
        donor: donation.donor,
      },
      razorpay_details: razorpayPaymentDetails,
      bank_account_info: {
        account_holder: "Connect Me Foundation", // Your organization name
        account_number: "****1234", // Masked account number
        ifsc_code: "HDFC0001234", // Your bank's IFSC
        bank_name: "HDFC Bank", // Your bank name
        branch: "Main Branch, Mumbai",
      },
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
