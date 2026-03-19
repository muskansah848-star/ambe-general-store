const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please provide name, email and password' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'customer',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.code === 11000)
      return res.status(400).json({ message: 'Email already registered' });
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.address) user.address = req.body.address;
    if (req.body.password) {
      if (req.body.password.length < 6)
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      user.password = req.body.password;
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatar: updated.avatar,
      token: generateToken(updated._id),
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
