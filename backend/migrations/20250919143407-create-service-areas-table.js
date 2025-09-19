'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ServiceArea', {
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
      label: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      coverageType: {
        type: Sequelize.ENUM('city', 'county', 'zip', 'custom'),
        allowNull: false
      },
      value: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('ServiceArea', ['businessPk']);
    await queryInterface.addIndex('ServiceArea', ['coverageType']);
    await queryInterface.addIndex('ServiceArea', ['value']);
    await queryInterface.addIndex('ServiceArea', ['businessPk', 'coverageType', 'value'], {
      unique: true,
      name: 'unique_business_coverage'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ServiceArea');
  }
};
