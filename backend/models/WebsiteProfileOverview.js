const _ = require('lodash')

module.exports = (sequelize, DataTypes) => {
  const WebsiteProfileOverview = sequelize.define(
    'WebsiteProfileOverview',
    {
      pk: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      websiteProfilePk: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'WebsiteProfile',
          key: 'pk',
        },
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      companyLogo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyPhone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
    }
  )

  WebsiteProfileOverview.associate = (db) => {
    db.WebsiteProfileOverview.belongsTo(db.WebsiteProfile, { foreignKey: 'websiteProfilePk' })
  }

  return WebsiteProfileOverview
}
