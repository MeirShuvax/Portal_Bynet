const { Op } = require('sequelize');
const { Honors, User, HonorsType } = require('../models');

const includeRelations = [
  { model: User, as: 'user', attributes: ['id', 'full_name', 'profile_image'] },
  { model: HonorsType, as: 'honorsType', attributes: ['id', 'name'] },
];

const ORDER_RECENT_FIRST = [
  ['display_until', 'DESC'],
  ['createdAt', 'DESC'],
];

const isActive = () => ({ display_until: { [Op.gt]: new Date() } });
const isInactive = () => ({ display_until: { [Op.lte]: new Date() } });

const withActiveFlag = (honor) => {
  const honorJson = honor.toJSON();
  honorJson.isActive = new Date(honorJson.display_until) > new Date();
  return honorJson;
};

const mapWithActiveFlag = (honors) => honors.map(withActiveFlag);

exports.getHonorById = async (req, res) => {
  const honor = await Honors.findByPk(req.params.id, { include: includeRelations });
  honor ? res.json(withActiveFlag(honor)) : res.status(404).json({ error: 'Honor not found' });
};

exports.getAllHonors = async (req, res) => {
  const honors = await Honors.findAll({ include: includeRelations, order: ORDER_RECENT_FIRST });
  res.json(mapWithActiveFlag(honors));
};

exports.getHonorsByUserActive = async (req, res) => {
  const { userId } = req.params;
  const honors = await Honors.findAll({
    where: { ...isActive(), user_id: userId },
    include: includeRelations,
    order: ORDER_RECENT_FIRST,
  });
  res.json(mapWithActiveFlag(honors));
};

exports.getHonorsByUserInactive = async (req, res) => {
  const { userId } = req.params;
  const honors = await Honors.findAll({
    where: { ...isInactive(), user_id: userId },
    include: includeRelations,
    order: ORDER_RECENT_FIRST,
  });
  res.json(mapWithActiveFlag(honors));
};

exports.getHonorsByTypeActive = async (req, res) => {
  const { typeId } = req.params;
  const honors = await Honors.findAll({
    where: { ...isActive(), honors_type_id: typeId },
    include: includeRelations,
    order: ORDER_RECENT_FIRST,
  });
  res.json(mapWithActiveFlag(honors));
};

exports.getHonorsByTypeInactive = async (req, res) => {
  const { typeId } = req.params;
  const honors = await Honors.findAll({
    where: { ...isInactive(), honors_type_id: typeId },
    include: includeRelations,
    order: ORDER_RECENT_FIRST,
  });
  res.json(mapWithActiveFlag(honors));
};

exports.getHonorsByType = async (req, res) => {
  const { typeId } = req.params;
  const includeExpired = req.query.includeExpired === 'true';
  const whereClause = { honors_type_id: typeId };

  if (!includeExpired) {
    Object.assign(whereClause, isActive());
  }

  const honors = await Honors.findAll({
    where: whereClause,
    include: includeRelations,
    order: ORDER_RECENT_FIRST,
  });

  res.json(mapWithActiveFlag(honors));
};

exports.getActiveHonors = async (req, res) => {
  const honors = await Honors.findAll({
    where: isActive(),
    include: includeRelations,
    order: ORDER_RECENT_FIRST,
  });
  res.json(mapWithActiveFlag(honors));
};

exports.getInactiveHonors = async (req, res) => {
  const honors = await Honors.findAll({
    where: isInactive(),
    include: includeRelations,
    order: ORDER_RECENT_FIRST,
  });
  res.json(mapWithActiveFlag(honors));
};

exports.createHonor = async (req, res) => {
  const { user_id, honors_type_id, display_until, description } = req.body;
  if (!user_id || !honors_type_id || !display_until) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newHonor = await Honors.create({ user_id, honors_type_id, display_until, description });
    const createdHonor = await Honors.findByPk(newHonor.id, { include: includeRelations });
    res.status(201).json(withActiveFlag(createdHonor));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create honor' });
  }
};

exports.updateHonor = async (req, res) => {
  const honor = await Honors.findByPk(req.params.id);
  if (!honor) return res.status(404).json({ error: 'Honor not found' });

  try {
    await honor.update(req.body);
    const updatedHonor = await honor.reload({ include: includeRelations });
    res.json(withActiveFlag(updatedHonor));
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
