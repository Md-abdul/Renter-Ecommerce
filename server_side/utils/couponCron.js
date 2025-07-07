const cron = require('node-cron');
const CouponModel = require('../Modals/coupanModal');
const moment = require('moment-timezone');

// Run every hour to check for expired coupons
const couponExpiryCheck = cron.schedule('30 13 * * *', async () => {
  try {
    const now = moment().tz('Asia/Kolkata').toDate();
    
    const result = await CouponModel.updateMany(
      { 
        expiryDate: { $lt: now },
        isActive: true 
      },
      { 
        $set: { isActive: false } 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`Deactivated ${result.modifiedCount} expired coupons`);
    }
  } catch (error) {
    console.error('Error in coupon expiry cron job:', error);
  }
});

module.exports = couponExpiryCheck;