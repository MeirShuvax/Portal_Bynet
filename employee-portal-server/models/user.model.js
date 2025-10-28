module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('viewer', 'editor', 'admin'),
      allowNull: false,
      defaultValue: 'viewer'
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        // מנהלים לא צריכים manager_id, עובדים רגילים כן
        requireManagerForNonAdmins(value) {
          if (this.role !== 'admin' && !value) {
            throw new Error('עובדים חייבים להיות תחת מנהל');
          }
        }
      }
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    profile_image: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      // לפני יצירת משתמש חדש, וודא שיש לו מנהל אם הוא לא מנהל
      beforeCreate: async (user) => {
        if (user.role !== 'admin' && !user.manager_id) {
          // בחר מנהל רנדומלי
          const admin = await sequelize.models.User.findOne({
            where: { role: 'admin' }
          });
          if (admin) {
            user.manager_id = admin.id;
          }
        }
      },
      // לפני עדכון משתמש, וודא שיש לו מנהל אם הוא לא מנהל
      beforeUpdate: async (user) => {
        if (user.role !== 'admin' && !user.manager_id) {
          // בחר מנהל רנדומלי
          const admin = await sequelize.models.User.findOne({
            where: { role: 'admin' }
          });
          if (admin) {
            user.manager_id = admin.id;
          }
        }
      }
    }
  });

  // הוספת מתודת השוואת סיסמאות
  User.prototype.comparePassword = async function(candidatePassword) {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(candidatePassword, this.password);
  };

  return User;
};
