
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      pk: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      orgPk: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Org',
          key: 'pk',
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user',
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['orgPk', 'email'],
          name: 'unique_org_email'
        }
      ]
    }
  )

  User.associate = (db) => {
    db.User.belongsTo(db.Org, { foreignKey: 'orgPk' });
  }
  return User
}
