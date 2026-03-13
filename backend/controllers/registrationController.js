const Registration = require('../models/Registration');
const Hackathon = require('../models/Hackathon');

// Register a team
const registerTeam = async (req, res) => {
  try {
    const { hackathonId, teamName, leaderName, leaderEmail, college, teamMembers } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Check for duplicate registration
    const existing = await Registration.findOne({ hackathon: hackathonId, leaderEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This email has already registered for this hackathon',
      });
    }

    const registration = await Registration.create({
      hackathon: hackathonId,
      teamName,
      leaderName,
      leaderEmail,
      college,
      teamMembers: teamMembers || [],
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: registration,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all registrations for a hackathon
const getRegistrations = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const registrations = await Registration.find({ hackathon: hackathonId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerTeam, getRegistrations };
