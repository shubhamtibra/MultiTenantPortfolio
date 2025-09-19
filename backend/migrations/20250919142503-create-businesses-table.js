'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Business', {
      pk: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      orgPk: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Org',
          key: 'pk'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      legalName: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      publicName: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tagline: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      about: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      phone: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      smsNumber: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      website: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      addressLine1: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      addressLine2: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      region: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      postalCode: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      country: {
        type: Sequelize.TEXT,
        defaultValue: 'US',
        allowNull: false
      },
      yearsInBusiness: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      licensed: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      insured: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      meta: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('Business', ['orgPk']);
    await queryInterface.addIndex('Business', ['email']);
    await queryInterface.addIndex('Business', ['publicName']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Business');
  }
};
