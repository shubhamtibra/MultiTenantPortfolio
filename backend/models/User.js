
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      pk: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
    },
    {
        freezeTableName: true,
        timestamps: true,
    }
  )

  User.associate = (db) => {
    db.User.hasOne(db.WebsiteProfile, { foreignKey: 'userPk' })
  }
  return User
}
