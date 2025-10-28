module.exports = (sequelize, DataTypes) => {
  const HonorsType = sequelize.define('HonorsType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'honors_types',
    timestamps: true
  });
  return HonorsType;
};
