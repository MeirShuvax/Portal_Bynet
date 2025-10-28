const { Op } = require('sequelize');
const { Wish, User, Honors, HonorsType } = require('../models');

// Get all wishes of type 'birthday'
exports.getBirthdayWishes = async (req, res) => {
  try {
    const wishes = await Wish.findAll({
      include: [
        { model: User, as: 'fromUser', attributes: ['id', 'full_name'] },
        {
          model: Honors,
          as: 'honor',
          include: [
            { model: User, as: 'user', attributes: ['id', 'full_name'] },
            { model: HonorsType, as: 'honorsType', where: { name: 'birthday' }, attributes: ['id', 'name'] }
          ]
        }
      ]
    });
    res.json(wishes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new wish
exports.createWish = async (req, res) => {
  try {
    const { honor_id, message } = req.body;
    const microsoftId = req.user.id; // זה UUID מ-Microsoft

    if (!honor_id || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // מצא את המשתמש המקומי לפי Microsoft ID
    const localUser = await User.findOne({
      where: { email: req.user.email }
    });

    if (!localUser) {
      return res.status(404).json({ error: 'User not found in local database' });
    }

    const from_user_id = localUser.id; // זה ה-INTEGER המקומי

    // Check if honor exists and is active
    const honor = await Honors.findOne({
      where: {
        id: honor_id,
        display_until: { [Op.gt]: new Date() }
      }
    });

    if (!honor) {
      return res.status(404).json({ error: 'Honor not found or not active' });
    }

    const newWish = await Wish.create({
      from_user_id,
      honor_id,
      message
    });

    // Return the created wish with all related data
    const wishWithRelations = await Wish.findByPk(newWish.id, {
      include: [
        { model: User, as: 'fromUser', attributes: ['id', 'full_name'] },
        {
          model: Honors,
          as: 'honor',
          include: [
            { model: User, as: 'user', attributes: ['id', 'full_name'] },
            { model: HonorsType, as: 'honorsType', attributes: ['id', 'name'] }
          ]
        }
      ]
    });

    res.status(201).json(wishWithRelations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get wishes for specific honor
exports.getWishesForHonor = async (req, res) => {
  try {
    const honorId = req.params.honorId;

    const wishes = await Wish.findAll({
      where: { honor_id: honorId },
      include: [
        { model: User, as: 'fromUser', attributes: ['id', 'full_name'] },
        {
          model: Honors,
          as: 'honor',
          include: [
            { model: User, as: 'user', attributes: ['id', 'full_name'] },
            { model: HonorsType, as: 'honorsType', attributes: ['id', 'name'] }
          ]
        }
      ]
    });

    res.json(wishes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
