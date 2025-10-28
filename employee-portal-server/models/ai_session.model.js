module.exports = (sequelize, DataTypes) => {
  const AISession = sequelize.define('AISession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    assistant_id: { type: DataTypes.STRING, allowNull: false },
    thread_id: { type: DataTypes.STRING, allowNull: false },
    is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_temporary: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ai_sessions',
    timestamps: false
  });
  return AISession;
};
