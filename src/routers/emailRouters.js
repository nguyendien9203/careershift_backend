const express = require("express");
const sendMail = require("../config/mailer");
const User = require("../models/User");
const router = express.Router();

router.post('/send_email', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: 'Email is required' });
  
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      await sendMail(user.email, 'Welcome!', 'Cảm ơn bạn đã đăng ký!');
      return res.json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  

module.exports = router;
