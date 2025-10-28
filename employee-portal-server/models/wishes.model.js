module.exports = (sequelize, DataTypes) => {
  const Wish = sequelize.define('Wish', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    honor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'honors',
        key: 'id'
      }
    },
    from_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'wishes',
    timestamps: false
  });
  return Wish;
};
