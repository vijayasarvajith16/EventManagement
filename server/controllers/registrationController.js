const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc   Register current student for an event
// @route  POST /api/events/:id/register
// @access Private (student)
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Check seat availability
    if (event.maxSeats !== null) {
      const count = await Registration.countDocuments({ event: event._id });
      if (count >= event.maxSeats) {
        return res.status(400).json({ success: false, message: 'Event is fully booked.' });
      }
    }

    const registration = await Registration.create({
      student: req.user._id,
      event: event._id,
    });

    res.status(201).json({ success: true, message: 'Successfully registered for the event.', registration });
  } catch (err) {
    // Duplicate key — already registered
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You are already registered for this event.' });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc   Unregister current student from an event
// @route  DELETE /api/events/:id/register
// @access Private (student)
exports.unregisterFromEvent = async (req, res) => {
  try {
    const registration = await Registration.findOneAndDelete({
      student: req.user._id,
      event: req.params.id,
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'You are not registered for this event.' });
    }

    res.status(200).json({ success: true, message: 'Successfully unregistered from the event.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc   Get all registered participants for an event
// @route  GET /api/events/:id/participants
// @access Private
exports.getParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const registrations = await Registration.find({ event: req.params.id })
      .populate('student', 'name email rollNumber department college year')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      event: { id: event._id, title: event.title },
      count: registrations.length,
      participants: registrations.map((r) => ({
        ...r.student.toObject(),
        registeredAt: r.createdAt,
      })),
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc   Get all events the current student is registered for
// @route  GET /api/registrations/my
// @access Private
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations: registrations.map((r) => ({
        registrationId: r._id,
        registeredAt: r.createdAt,
        event: r.event,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
