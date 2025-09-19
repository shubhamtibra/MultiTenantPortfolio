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
      businessPk: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Business',
          key: 'pk',
        },
      },
      subdomain: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customDomain: {
        type: DataTypes.STRING,
        allowNull: true,
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
          fields: ['subdomain'],
          name: 'unique_subdomain'
        },
        {
          unique: true,
          fields: ['customDomain'],
          name: 'unique_custom_domain',
          where: {
            customDomain: {
              [sequelize.Sequelize.Op.ne]: null
            }
          }
        }
      ]
    }
  )

  WebsiteProfile.associate = (db) => {
    db.WebsiteProfile.belongsTo(db.Business, { foreignKey: 'businessPk' })
  }

  return WebsiteProfile
}
