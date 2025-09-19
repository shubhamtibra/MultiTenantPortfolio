'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BusinessService', {
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
      servicePk: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Service',
          key: 'pk'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      customDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      priceDisplay: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
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

    // Add primary key constraint
    await queryInterface.addConstraint('BusinessService', {
      fields: ['businessPk', 'servicePk'],
      type: 'primary key',
      name: 'business_service_pkey'
    });

    // Add indexes
    await queryInterface.addIndex('BusinessService', ['businessPk']);
    await queryInterface.addIndex('BusinessService', ['servicePk']);
    await queryInterface.addIndex('BusinessService', ['featured']);
    await queryInterface.addIndex('BusinessService', ['sortOrder']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BusinessService');
  }
};
