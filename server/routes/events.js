const express = require('express');
const { body } = require('express-validator');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const {
  registerForEvent,
  unregisterFromEvent,
  getParticipants,
} = require('../controllers/registrationController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const eventRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3 }),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 }),
  body('date').isISO8601().withMessage('Valid date is required (ISO 8601)'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('maxSeats')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Max seats must be a positive integer'),
];

// Event CRUD
router.post('/', protect, adminOnly, eventRules, validate, createEvent);
router.get('/', protect, getAllEvents);
router.get('/:id', protect, getEventById);
router.put('/:id', protect, adminOnly, eventRules, validate, updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

// Registration sub-routes
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, unregisterFromEvent);
router.get('/:id/participants', protect, getParticipants);

module.exports = router;
