const User = require("../models/User");

const incrementContribution = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const user = await User.findById(userId);
    if (!user) return;

    const contributionIndex = user.contributions.findIndex(c => c.date === today);

    if (contributionIndex !== -1) {
      user.contributions[contributionIndex].count += 1;
    } else {
      user.contributions.push({ date: today, count: 1 });
    }

    await user.save();
    console.log(`Contribution recorded for user ${user.username} on ${today}`);
  } catch (err) {
    console.error("Failed to increment contribution:", err.message);
  }
};

module.exports = { incrementContribution };
