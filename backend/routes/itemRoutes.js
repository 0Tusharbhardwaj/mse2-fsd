const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// GET /api/items/search?name=xyz
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.json([]);
    const items = await Item.find({
      $or: [
        { itemName: { $regex: name, $options: 'i' } },
        { type: { $regex: name, $options: 'i' } }
      ]
    }).populate('userId', 'name email');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/items (get all)
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/items/:id (single item)
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id().populate('userId', 'name email'));
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/items (create)
router.post('/', auth, async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;
    const newItem = new Item({
      itemName,
      description,
      type,
      location,
      date,
      contactInfo,
      userId: req.userId
    });
    const item = await newItem.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/items/:id (update)
router.put('/:id', auth, async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Ensure user owns item
    if (item.userId.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized to update this item' });
    }

    const { itemName, description, type, location, date, contactInfo } = req.body;
    item.itemName = itemName || item.itemName;
    item.description = description || item.description;
    item.type = type || item.type;
    item.location = location || item.location;
    item.date = date || item.date;
    item.contactInfo = contactInfo || item.contactInfo;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/items/:id (delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Ensure user owns item
    if (item.userId.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
