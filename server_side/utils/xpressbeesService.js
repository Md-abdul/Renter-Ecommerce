const axios = require("axios");
require("dotenv").config();

let tokenCache = null;

// ✅ Function to get Xpressbees token
const getXpressbeesToken = async () => {
  if (tokenCache) return tokenCache;

  const response = await axios.post(
    "https://shipment.xpressbees.com/api/users/login",
    {
      email: process.env.XPRESSBEES_EMAIL,
      password: process.env.XPRESSBEES_PASSWORD,
    },
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );

  tokenCache = response.data.data;
  console.log(tokenCache);
  return tokenCache;
};

// ✅ Function to create shipment (AWB generation)
const createShipment = async (order) => {
  const token = await getXpressbeesToken();

  // ✅ Safe extraction
const address = order.shippingAddress?.address || {};
const state = address?.state?.trim(); // ✅ FIXED: correctly get nested state
const city = address?.city?.trim();
const street = address?.street?.trim();
const pincode = address?.zipCode?.trim();
const phone = order.shippingAddress?.phoneNumber?.trim();
const name = order.shippingAddress?.name?.trim();

  // ✅ Validate required fields
  if (!state || !city || !street || !pincode || !phone || !name) {
    console.error("Missing required address fields:", {
      state, city, street, pincode, phone, name,
    });
    throw new Error("Incomplete address. AWB cannot be generated.");
  }

  const payload = {
    order_number: order.orderNumber || "ORDER" + Date.now(),
    payment_type: order.paymentMethod.toLowerCase(), // 'cod' or 'prepaid'
    shipping_charges: 0,
    cod_charges: order.paymentMethod.toLowerCase() === "cod" ? 40 : 0,
    discount: 0,
    order_amount: order.totalAmount,
    package_weight: 300,
    package_length: 10,
    package_breadth: 10,
    package_height: 10,
    request_auto_pickup: "yes",

    consignee: {
      name,
      address: street,
      address_2: "N/A",
      city,
      state,
      pincode,
      phone,
    },

    pickup: {
      warehouse_name: "Warehouse1",
      name: "YourCompany",
      address: "140, MG Road",
      address_2: "Near metro station",
      city: "Gurgaon",
      state: "Haryana",
      pincode: "122001",
      phone: "9999999999",
    },

    order_items: order.items.map((item) => ({
      name: item.name,
      qty: item.quantity,
      price: item.price,
      sku: item.productId?.toString() || "SKU001",
    })),

    courier_id: "1",
    collectable_amount:
      order.paymentMethod.toLowerCase() === "cod" ? order.totalAmount : 0,
  };

  try {
    const response = await axios.post(
      "https://shipment.xpressbees.com/api/shipments2",
      payload,
      {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("AWB response from Xpressbees:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Xpressbees shipment API error:",
      error.response?.data || error.message
    );
    throw error;
  }
};


module.exports = {
  getXpressbeesToken,
  createShipment,
};
