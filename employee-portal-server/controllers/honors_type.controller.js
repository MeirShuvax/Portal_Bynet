const { HonorsType } = require('../models');

// GET all honors types (open to all users)
exports.getAllHonorsTypes = async (req, res) => {
  try {
    const types = await HonorsType.findAll();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST create new honors type (admin only)
exports.createHonorsType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const exists = await HonorsType.findOne({ where: { name } });
    if (exists) return res.status(400).json({ error: 'Type already exists' });

    const newType = await HonorsType.create({ name });
    res.status(201).json(newType);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT update honors type (admin only)
exports.updateHonorsType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await HonorsType.findByPk(id);

    if (!type) return res.status(404).json({ error: 'Type not found' });

    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    type.name = name;
    await type.save();

    res.json(type);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE honors type (admin only)
exports.deleteHonorsType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await HonorsType.findByPk(id);

    if (!type) return res.status(404).json({ error: 'Type not found' });

    await type.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
