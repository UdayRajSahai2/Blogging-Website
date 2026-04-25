// ---------------- Node.js / Core ----------------
import crypto from "crypto";

// ---------------- Service Configs ----------------
import "../config/firebase.config.js";
import razorpay from "../config/razorpay.config.js";
import sequelize from "../config/db.config.js";

// ---------------- Models ----------------
import { User, Donor, Donation } from "../models/associations.js";

/**
 * ================================
 * CREATE RAZORPAY ORDER
 * ================================
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys not configured");
      return res.status(500).json({ error: "Razorpay keys not configured" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100), // paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        user_id: req.user.id,
      },
    });

    return res.json({ order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res
      .status(500)
      .json({ error: `Failed to create payment order: ${error.message}` });
  }
};

/**
 * ================================
 * VERIFY PAYMENT + SAVE DONATION
 * ================================
 */
export const verifyPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      purpose,
      bank_account,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Missing payment verification data" });
    }

    // ✅ Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await transaction.rollback();
      return res.status(400).json({
        valid: false,
        message: "Invalid payment signature",
      });
    }

    // ✅ Prevent duplicate payment
    const existingDonation = await Donation.findOne({
      where: { payment_id: razorpay_payment_id },
      transaction,
    });

    if (existingDonation) {
      await transaction.commit();
      return res.json({
        valid: true,
        message: "Payment already recorded",
        donation: existingDonation,
      });
    }

    // ✅ Find or create donor
    let donor = await Donor.findOne({
      where: { user_id: req.user.id },
      transaction,
    });

    if (!donor) {
      donor = await Donor.create(
        {
          user_id: req.user.id,
          customer_id: `cust_${Date.now()}`,
        },
        { transaction },
      );
    }

    const today = new Date();
    const year = today.getFullYear();

    // ✅ Create donation
    const donation = await Donation.create(
      {
        donor_id: donor.donor_id,
        user_id: req.user.id,
        customer_id: donor.customer_id,
        purpose,
        amount,
        date: today,
        year,
        payment_id: razorpay_payment_id,
        payment_signature: razorpay_signature,
        payment_status: "completed",
        bank_account,
        transfer_status: "pending",
      },
      { transaction },
    );

    await transaction.commit();

    return res.json({
      valid: true,
      message: "Payment verified successfully",
      donation,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};

/**
 * ================================
 * GET PAYMENT DETAILS
 * ================================
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const { payment_id } = req.query;

    if (!payment_id) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

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

    // Optional Razorpay fetch
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
    } catch (err) {
      console.error("Error fetching Razorpay payment details:", err);
    }

    res.json({
      donation,
      razorpay_details: razorpayPaymentDetails,
      bank_account_info: {
        account_holder: "REACH Foundation",
        account_number: "****1234",
        ifsc_code: "HDFC0001234",
        bank_name: "HDFC Bank",
        branch: "Main Branch, Mumbai",
      },
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
