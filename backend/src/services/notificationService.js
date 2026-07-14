const twilio = require('twilio');
const Notification = require('../models/notificationModel');

// Helper to load and validate Twilio credentials on demand
let twilioClient;
const getTwilioClient = () => {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials (SID or Auth Token) are not set in environment variables');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
};

/**
 * Notification Service
 */
const notificationService = {
  /**
   * Send WhatsApp message to a phone number using Twilio, logging results in notifications table
   */
  sendWhatsAppMessage: async (phone, message, customerId = null) => {
    const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    // Ensure "whatsapp:" prefix is present
    const toWhatsApp = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;

    let status = 'failed';
    let sid = null;
    let errorMessage = null;

    try {
      const client = getTwilioClient();
      const response = await client.messages.create({
        from: fromWhatsApp,
        to: toWhatsApp,
        body: message
      });
      status = 'sent';
      sid = response.sid;
    } catch (error) {
      errorMessage = error.message;
    }

    // Save every notification attempt (sent or failed) to DB
    const logData = {
      customer_id: customerId,
      phone: phone,
      message: message,
      status: status,
      sid: sid,
      error_message: errorMessage
    };

    const notificationRecord = await Notification.create(logData);

    // If delivery failed, raise exception for the controller to catch, but return log data inside it
    if (status === 'failed') {
      const err = new Error(errorMessage || 'Failed to dispatch WhatsApp message via Twilio');
      err.statusCode = 500;
      err.notificationRecord = notificationRecord;
      throw err;
    }

    return notificationRecord;
  },

  /**
   * Send WhatsApp order booking confirmation details (Customer)
   */
  sendOrderConfirmation: async (customer, order) => {
    if (!customer || !customer.phone) {
      throw new Error('Customer phone number is required to send confirmation message');
    }

    const message = `Hello ${customer.name || 'Valued Customer'},\n\nYour water delivery order has been successfully placed!\n\nOrder Details:\n- Quantity: ${order.quantity} units\n- Delivery Date: ${order.delivery_date}\n- Delivery Address: ${order.address}\n- Status: Pending\n\nThank you for booking with us!`;

    return await notificationService.sendWhatsAppMessage(customer.phone, message, customer.id);
  },

  /**
   * Send WhatsApp order delivery status updates (Customer)
   */
  sendDeliveryUpdate: async (customer, order) => {
    if (!customer || !customer.phone) {
      throw new Error('Customer phone number is required to send delivery update message');
    }

    const message = `Hello ${customer.name || 'Valued Customer'},\n\nYour water delivery order status has been updated!\n\nOrder Details:\n- Order ID: ${order.id}\n- Current Status: ${order.status.toUpperCase()}\n\nThank you for booking with us!`;

    return await notificationService.sendWhatsAppMessage(customer.phone, message, customer.id);
  },

  /**
   * Broadcast a disruption announcement to all customers simultaneously (Supplier broadcast)
   */
  sendDisruptionBroadcast: async (customers, message) => {
    if (!Array.isArray(customers) || customers.length === 0) {
      throw new Error('An array of customers is required to broadcast notifications');
    }

    const results = [];

    // Send messages to all customers concurrently
    const sendPromises = customers.map(async (customer) => {
      try {
        const record = await notificationService.sendWhatsAppMessage(customer.phone, message, customer.id);
        return { customerId: customer.id, success: true, notificationId: record.id };
      } catch (err) {
        return { customerId: customer.id, success: false, error: err.message };
      }
    });

    return await Promise.all(sendPromises);
  },

  /**
   * Fetch notification history for a specific customer ID
   */
  getCustomerNotifications: async (customerId) => {
    return await Notification.findByCustomer(customerId);
  }
};

module.exports = notificationService;
