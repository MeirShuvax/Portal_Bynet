module.exports = (sequelize, DataTypes) => {
  const Honors = sequelize.define('Honors', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    honors_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'honors_types',
        key: 'id'
      }
    },
    display_until: {
      type: DataTypes.DATE,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'honors',
    timestamps: true
  });
  return Honors;
};
