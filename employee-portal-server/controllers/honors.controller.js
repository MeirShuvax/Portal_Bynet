const { Op } = require('sequelize');
const { Honors, User, HonorsType } = require('../models');

const includeRelations = [
  { model: User, as: 'user', attributes: ['id', 'full_name'] },
  { model: HonorsType, as: 'honorsType', attributes: ['id', 'name'] }
];

const isActive = () => ({ display_until: { [Op.gt]: new Date() } });
const isInactive = () => ({ display_until: { [Op.lte]: new Date() } });

exports.getHonorById = async (req, res) => {
  const honor = await Honors.findByPk(req.params.id, { include: includeRelations });
  honor ? res.json(honor) : res.status(404).json({ error: 'Honor not found' });
};

exports.getAllHonors = async (req, res) => {
  const honors = await Honors.findAll({ include: includeRelations });
  res.json(honors);
};

exports.getHonorsByUserActive = async (req, res) => {
  const { userId } = req.params;
  const honors = await Honors.findAll({
    where: { ...isActive(), user_id: userId },
    include: includeRelations
  });
  res.json(honors);
};

exports.getHonorsByUserInactive = async (req, res) => {
  const { userId } = req.params;
  const honors = await Honors.findAll({
    where: { ...isInactive(), user_id: userId },
    include: includeRelations
  });
  res.json(honors);
};

exports.getHonorsByTypeActive = async (req, res) => {
  const { typeId } = req.params;
  const honors = await Honors.findAll({
    where: { ...isActive(), honors_type_id: typeId },
    include: includeRelations
  });
  res.json(honors);
};

exports.getHonorsByTypeInactive = async (req, res) => {
  const { typeId } = req.params;
  const honors = await Honors.findAll({
    where: { ...isInactive(), honors_type_id: typeId },
    include: includeRelations
  });
  res.json(honors);
};

exports.getActiveHonors = async (req, res) => {
  const honors = await Honors.findAll({
    where: isActive(),
    include: includeRelations
  });
  res.json(honors);
};

exports.getInactiveHonors = async (req, res) => {
  const honors = await Honors.findAll({
    where: isInactive(),
    include: includeRelations
  });
  res.json(honors);
};

exports.createHonor = async (req, res) => {
  const { user_id, honors_type_id, display_until } = req.body;
  if (!user_id || !honors_type_id || !display_until) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newHonor = await Honors.create({ user_id, honors_type_id, display_until });
    res.status(201).json(newHonor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create honor' });
  }
};

exports.updateHonor = async (req, res) => {
  const honor = await Honors.findByPk(req.params.id);
  if (!honor) return res.status(404).json({ error: 'Honor not found' });

  try {
    await honor.update(req.body);
    res.json(honor);
  } catch {
    res.status(400).json({ error: 'Update failed' });
  }
};

exports.deleteHonor = async (req, res) => {
  const honor = await Honors.findByPk(req.params.id);
  if (!honor) return res.status(404).json({ error: 'Honor not found' });

  await honor.destroy();
  res.json({ message: 'Honor deleted' });
};
