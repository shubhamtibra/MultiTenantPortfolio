const _ = require('lodash')

const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const WebsiteProfile = sequelize.define(
    'WebsiteProfile',
    {
      pk: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userPk: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'User',
          key: 'pk',
        },
      },
      subdomain: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
    }
  )

  WebsiteProfile.associate = (db) => {
    db.WebsiteProfile.belongsTo(db.User, { foreignKey: 'userPk' })
    db.WebsiteProfile.hasMany(db.WebsiteProfileSection, { foreignKey: 'websiteProfilePk' })
    db.WebsiteProfile.hasOne(db.WebsiteProfileOverview, { foreignKey: 'websiteProfilePk' })
  }

  return WebsiteProfile
}
