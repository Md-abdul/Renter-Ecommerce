// const dotenv = require("dotenv");
// dotenv.config();
// const SibApiV3Sdk = require("sib-api-v3-sdk");
// const { OrderModel } = require("../Modals/UserModal");

// // Configure Brevo API
// const defaultClient = SibApiV3Sdk.ApiClient.instance;
// const apiKey = defaultClient.authentications["api-key"];
// apiKey.apiKey = process.env.BREVO_API_KEY;

// const sendOrderConfirmationEmail = async (orderId) => {
//   try {
//     const order = await OrderModel.findById(orderId).populate("userId");
//     if (!order) {
//       console.error("Order not found");
//       return false;
//     }

//     const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
//     const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

//     // Format order items for email with images
//     const orderItemsHtml = order.items
//       .map(
//         (item) => `
//       <tr>
//         <td style="padding: 15px; border-bottom: 1px solid #eaeaea; vertical-align: top;">
//           <table style="width: 100%;">
//             <tr>
//               <td style="width: 80px; padding-right: 15px; vertical-align: top;">
//                 <img src="${item.image}" alt="${
//           item.name
//         }" style="width: 80px; height: auto; border: 1px solid #eaeaea; border-radius: 4px;">
//               </td>
//               <td style="vertical-align: top;">
//                 <p style="margin: 0 0 5px 0; font-weight: 600; color: #333;">${
//                   item.name
//                 }</p>
//                 ${
//                   item.size
//                     ? `<p style="margin: 0 0 5px 0; color: #666;">Size: ${item.size}</p>`
//                     : ""
//                 }
//                 <p style="margin: 0; color: #666;">Qty: ${item.quantity}</p>
//               </td>
//               <td style="text-align: right; vertical-align: top; font-weight: 600;">
//                 Rs. ${item.price.toFixed(2)}
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     `
//       )
//       .join("");

//     // Calculate totals
//     const subtotal = order.items.reduce(
//       (sum, item) => sum + item.price * item.quantity,
//       0
//     );
//     const tax = subtotal * 0.12;
//     const total = subtotal + tax;

//     sendSmtpEmail.subject = `Your Ranter Order #${order._id
//       .toString()
//       .slice(-5)}`;
//     sendSmtpEmail.htmlContent = `
//       <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
//         <!-- Header -->
//         <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-bottom: 1px solid #eaeaea;">
//           <h1 style="margin: 0; color: #2c3e50;">Thank you for your order!</h1>
//           <p style="margin: 10px 0 0 0; color: #7f8c8d;">Order #${order._id
//             .toString()
//             .slice(-5)} • ${order.createdAt.toLocaleString()}</p>
//         </div>

//         <!-- Order Summary -->
//         <div style="padding: 20px;">
//           <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 18px;">Order Summary</h2>

//           <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
//             ${orderItemsHtml}
//           </table>

//           <!-- Order Totals -->
//           <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
//             <tr>
//               <td style="padding: 8px 0; text-align: left; border-bottom: 1px solid #eaeaea;">Subtotal</td>
//               <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eaeaea;">Rs. ${subtotal.toFixed(
//                 2
//               )}</td>
//             </tr>
//             <tr>
//               <td style="padding: 8px 0; text-align: left; border-bottom: 1px solid #eaeaea;">Shipping</td>
//               <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eaeaea;">Rs. 0.00</td>
//             </tr>
//             <tr>
//               <td style="padding: 8px 0; text-align: left; border-bottom: 1px solid #eaeaea;">Tax (GST 12.0%)</td>
//               <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eaeaea;">Rs. ${tax.toFixed(
//                 2
//               )}</td>
//             </tr>
//             <tr>
//               <td style="padding: 12px 0; text-align: left; font-weight: bold; font-size: 16px;">Total</td>
//               <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 16px;">Rs. ${total.toFixed(
//                 2
//               )}</td>
//             </tr>
//           </table>

//           <!-- Order Details -->
//           <div style="display: flex; margin-bottom: 30px; flex-wrap: wrap;">
//             <div style="flex: 1; min-width: 250px; margin-bottom: 15px;">
//               <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px;">Payment Method</h3>
//               <p style="margin: 0; color: #7f8c8d;">${order.paymentMethod}</p>
//             </div>
//             <div style="flex: 1; min-width: 250px;">
//               <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px;">Shipping Address</h3>
//               <p style="margin: 0 0 5px 0; color: #7f8c8d;">
//                 ${order.shippingAddress.name}<br>
//                 ${order.shippingAddress.address.street}<br>
//                 ${order.shippingAddress.address.city}, ${
//       order.shippingAddress.address.state
//     }<br>
//                 ${order.shippingAddress.address.zipCode}<br>
//                 Phone: ${order.shippingAddress.phoneNumber}
//               </p>
//             </div>
//           </div>

//           <!-- CTA Button -->
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.FRONTEND_URL}/orders/${
//       order._id
//     }" style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">View Your Order</a>
//           </div>
//         </div>

//         <!-- Footer -->
//         <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #7f8c8d; border-top: 1px solid #eaeaea;">
//           <p style="margin: 0;">© ${new Date().getFullYear()} ${
//       process.env.STORE_NAME
//     }. All rights reserved.</p>
//           <p style="margin: 5px 0 0 0;">${process.env.STORE_ADDRESS}</p>
//           <p style="margin: 5px 0 0 0;">
//             <a href="mailto:${
//               process.env.STORE_SUPPORT_EMAIL
//             }" style="color: #3498db; text-decoration: none;">Contact Support</a>
//           </p>
//         </div>
//       </div>
//     `;

//     // Email configuration
//     sendSmtpEmail.sender = {
//       name: process.env.STORE_NAME || "Ranter Store",
//       email: process.env.STORE_EMAIL || "store@ranter.com",
//     };
//     sendSmtpEmail.to = [{ email: order.userId.email, name: order.userId.name }];
//     sendSmtpEmail.replyTo = {
//       email: process.env.STORE_SUPPORT_EMAIL || "support@ranter.com",
//       name: process.env.STORE_NAME || "Ranter Support",
//     };

//     await apiInstance.sendTransacEmail(sendSmtpEmail);
//     return true;
//   } catch (error) {
//     console.error("Error sending order confirmation email:", error);
//     return false;
//   }
// };

// module.exports = { sendOrderConfirmationEmail };

const dotenv = require("dotenv");
dotenv.config();
const SibApiV3Sdk = require("sib-api-v3-sdk");
const { OrderModel } = require("../Modals/UserModal");

// Configure Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const sendOrderConfirmationEmail = async (orderId) => {
  try {
    const order = await OrderModel.findById(orderId).populate("userId");
    if (!order) {
      console.error("Order not found");
      return false;
    }

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Format order items for email with images and prices
    const orderItemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eaeaea; vertical-align: top;">
          <table style="width: 100%;">
            <tr>
              <td style="width: 80px; padding-right: 15px; vertical-align: top;">
                <img src="${item.image}" alt="${
          item.name
        }" style="width: 80px; height: auto; border: 1px solid #eaeaea; border-radius: 4px;">
              </td>
              <td style="vertical-align: top;">
                <p style="margin: 0 0 5px 0; font-weight: 600; color: #333;">${
                  item.name
                }</p>
                ${
                  item.size
                    ? `<p style="margin: 0 0 5px 0; color: #666;">Size: ${item.size}</p>`
                    : ""
                }
                <p style="margin: 0; color: #666;">Qty: ${item.quantity}</p>
              </td>
              <td style="text-align: right; vertical-align: top; font-weight: 600;">
                ₹${item.price.toFixed(2)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
      )
      .join("");

    // Calculate original subtotal
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Calculate total after discount
    const total = order.totalAmount;

    sendSmtpEmail.subject = `Your Ranter Order #${order.orderNumber}`;
    sendSmtpEmail.htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <!-- Header -->
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-bottom: 1px solid #eaeaea;">
          <h1 style="margin: 0; color: #2c3e50;">Thank you for your order!</h1>
          <p style="margin: 10px 0 0 0; color: #7f8c8d;">Order #${order._id
            .toString()
            .slice(-5)} • ${order.createdAt.toLocaleString()}</p>
        </div>
        
        <!-- Order Summary -->
        <div style="padding: 20px;">
          <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 18px;">Order Summary</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            ${orderItemsHtml}
          </table>
          
          <!-- Order Totals -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="padding: 8px 0; text-align: left; border-bottom: 1px solid #eaeaea;">Subtotal</td>
              <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eaeaea;">₹${subtotal.toFixed(
                2
              )}</td>
            </tr>
            
            ${
              order.appliedCoupon
                ? `
                <tr>
                  <td style="padding: 8px 0; text-align: left; border-bottom: 1px solid #eaeaea;">
                    Discount Applied (${order.appliedCoupon.couponCode} - ${
                    order.appliedCoupon.discountPercentage
                  }%)
                  </td>
                  <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eaeaea; color: #e74c3c;">
                    -₹${(subtotal - total).toFixed(2)}
                  </td>
                </tr>
                `
                : ""
            }
            
            <tr>
              <td style="padding: 12px 0; text-align: left; font-weight: bold; font-size: 16px;">Total</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 16px;">₹${total.toFixed(
                2
              )}</td>
            </tr>
          </table>
          
          <!-- Order Details -->
          <div style="display: flex; margin-bottom: 30px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 250px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px;">Payment Method</h3>
              <p style="margin: 0; color: #7f8c8d;">${
                order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : order.paymentMethod
              }</p>
            </div>
            <div style="flex: 1; min-width: 250px;">
              <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px;">Shipping Address</h3>
              <p style="margin: 0 0 5px 0; color: #7f8c8d;">
                ${order.shippingAddress.name}<br>
                ${order.shippingAddress.address.street}<br>
                ${order.shippingAddress.address.city}, ${
      order.shippingAddress.address.state
    }<br>
                ${order.shippingAddress.address.zipCode}<br>
                Phone: ${order.shippingAddress.phoneNumber}
              </p>
            </div>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${
      order._id
    }" style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">View Your Order</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #7f8c8d; border-top: 1px solid #eaeaea;">
          <p style="margin: 0;">© ${new Date().getFullYear()} ${
      process.env.STORE_NAME
    }. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">${process.env.STORE_ADDRESS}</p>
          <p style="margin: 5px 0 0 0;">
            <a href="mailto:${
              process.env.STORE_SUPPORT_EMAIL
            }" style="color: #3498db; text-decoration: none;">Contact Support</a>
          </p>
        </div>
      </div>
    `;

    // Email configuration
    sendSmtpEmail.sender = {
      name: process.env.STORE_NAME || "Ranter Store",
      email: process.env.STORE_EMAIL || "store@ranter.com",
    };
    sendSmtpEmail.to = [{ email: order.userId.email, name: order.userId.name }];
    sendSmtpEmail.replyTo = {
      email: process.env.STORE_SUPPORT_EMAIL || "support@ranter.com",
      name: process.env.STORE_NAME || "Ranter Support",
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
};

module.exports = { sendOrderConfirmationEmail };
