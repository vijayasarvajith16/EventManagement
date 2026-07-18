const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc   Create a new event
// @route  POST /api/events
// @access Private (admin only)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, maxSeats, category } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      maxSeats: maxSeats || null,
      category: category || 'General',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc   Get all events (with registration count)
// @route  GET /api/events
// @access Private
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    // Attach registration counts
    const eventsWithCount = await Promise.all(
      events.map(async (event) => {
        const count = await Registration.countDocuments({ event: event._id });
        return { ...event.toObject(), registrationCount: count };
      })
    );

    res.status(200).json({ success: true, count: events.length, events: eventsWithCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc   Get a single event by ID
// @route  GET /api/events/:id
// @access Private
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const registrationCount = await Registration.countDocuments({ event: event._id });

    // Check if requesting user is already registered
    let isRegistered = false;
    if (req.user) {
      const reg = await Registration.findOne({ student: req.user._id, event: event._id });
      isRegistered = !!reg;
    }

    res.status(200).json({
      success: true,
      event: { ...event.toObject(), registrationCount, isRegistered },
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc   Update an event
// @route  PUT /api/events/:id
// @access Private (admin only)
exports.updateEvent = async (req, res) => {
  try {
    const { title, description, date, venue, maxSeats, category } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, date, venue, maxSeats, category },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.status(200).json({ success: true, event });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc   Delete an event (and all its registrations)
// @route  DELETE /api/events/:id
// @access Private (admin only)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Cascade delete registrations
    await Registration.deleteMany({ event: req.params.id });

    res.status(200).json({ success: true, message: 'Event deleted successfully.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
