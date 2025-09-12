const _ = require('lodash')

const Sequelize = require('sequelize')

const { orgAsDict, manyUsersAsDict, hrmsProviderAsDict } = require('../queryFragments/associationNames')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      pk: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      __modelName: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.constructor.name
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
        // allowNull defaults to true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      orgPk: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Org', key: 'pk' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // users may be generated without password incase of oauth integrations
      },

      // employmentType, employmentIsNew, & employmentStatus will be present only if userType is staffMember
      employmentType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      employmentStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // represents whether employee is joining new or existing employee getting added to sprinto
      employmentIsNew: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },

      //userConstants.userLoginStatusType
      userLoginStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      employmentStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      employmentEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      createdVia: {
        type: DataTypes.ENUM(..._.values(createdViaTypes)),
        allowNull: true,
      },
      hrmsProviderPk: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      isOnboardingComplete: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
        freezeTableName: true,
      indexes: [
        {
          fields: ['orgPk', 'email'],
          unique: true,
          where: { employmentStatus: { [Sequelize.Op.or]: activeUserStatuses } },
        },
        {
          name: 'idx_user_first_name_gin',
          using: 'gin',
          fields: ['firstName'],
          operator: 'gin_trgm_ops',
        },
        {
          name: 'idx_user_last_name_gin',
          using: 'gin',
          fields: ['lastName'],
          operator: 'gin_trgm_ops',
        },
        {
          name: 'idx_user_email_gin',
          using: 'gin',
          fields: ['email'],
          operator: 'gin_trgm_ops',
        },
        {
          fields: ['isOnboardingComplete', 'orgPk'],
        },
        {
          fields: ['orgPk', 'isInScope', 'employmentStatus'],
        },
      ],
    }
  )

  User.associate = (db) => {
    db.User.belongsTo(db.Org, { foreignKey: 'orgPk', ...orgAsDict })
    db.User.belongsTo(db.HrmsProvider, { foreignKey: 'hrmsProviderPk', ...hrmsProviderAsDict })
    db.Org.hasMany(db.User, { foreignKey: 'orgPk', ...manyUsersAsDict })
    db.User.hasMany(db.Monitor, { foreignKey: 'entityPk', constraints: false })
    db.User.hasMany(db.Endpoint, { foreignKey: 'ownerPk', constraints: false })
    db.User.hasMany(db.StaffAcknowledgement, { foreignKey: 'userPk', constraints: false })
    db.User.hasMany(db.ScopeChangeLog, {
      foreignKey: 'entityPk',
      constraints: false,
      as: 'scopeChangeLogs',
    })
  }

  return User
}
