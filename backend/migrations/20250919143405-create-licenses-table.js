'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('License', {
      pk: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      businessPk: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Business',
          key: 'pk'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      licenseNo: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      authority: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      state: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expiresOn: {
        type: Sequelize.DATEONLY,
        allowNull: true
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
    await queryInterface.addIndex('License', ['businessPk']);
    await queryInterface.addIndex('License', ['licenseNo']);
    await queryInterface.addIndex('License', ['authority']);
    await queryInterface.addIndex('License', ['state']);
    await queryInterface.addIndex('License', ['expiresOn']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('License');
  }
};
