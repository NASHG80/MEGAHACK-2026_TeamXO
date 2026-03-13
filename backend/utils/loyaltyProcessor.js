const User = require('../models/User');

const addLoyaltyPoints = async (organizerId, points, action) => {
  try {
    await User.findByIdAndUpdate(organizerId, {
      $inc: { loyaltyPoints: points },
      $push: {
        loyaltyHistory: {
          action,
          points,
          date: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Failed to add loyalty points:', error);
  }
};

module.exports = { addLoyaltyPoints };
