const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const sendTokenResponse = (student, statusCode, res) => {
  const token = signToken(student._id);
  res.status(statusCode).json({
    success: true,
    token,
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      college: student.college,
      department: student.department,
      year: student.year,
      role: student.role,
    },
  });
};

// @desc   Register a new student
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, rollNumber, department, college, year } = req.body;

    const student = await Student.create({
      name,
      email,
      password,
      rollNumber,
      department,
      college,
      year,
      role: 'student', // always student on public register
    });

    sendTokenResponse(student, 201, res);
  } catch (err) {
    // Duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Roll number'} is already registered.`,
      });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc   Login student
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email }).select('+password');
    if (!student || !(await student.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    sendTokenResponse(student, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc   Get current logged-in student profile
// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, student: req.user });
};
