const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { validateEmail, validatePassword, sanitizeString } = require('../middleware/validationMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate name
    const sanitizedName = sanitizeString(name);
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters' });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ success: false, message: passwordErrors.join('. ') });
    }

    // Check passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check existing user
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await UserModel.create({
      name: sanitizedName,
      email,
      password_hash,
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user (including password_hash for comparison)
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user without password_hash
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, monthly_income, currency } = req.body;
    const updates = {};

    if (name) updates.name = sanitizeString(name);
    if (monthly_income !== undefined) {
      if (isNaN(Number(monthly_income)) || Number(monthly_income) < 0) {
        return res.status(400).json({ success: false, message: 'Monthly income must be a valid number' });
      }
      updates.monthly_income = Number(monthly_income);
    }
    if (currency) {
      const validCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
      if (!validCurrencies.includes(currency)) {
        return res.status(400).json({ success: false, message: 'Invalid currency' });
      }
      updates.currency = currency;
    }

    const user = await UserModel.update(req.user.id, updates);

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };
