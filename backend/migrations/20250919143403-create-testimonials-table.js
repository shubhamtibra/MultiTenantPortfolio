'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Testimonial', {
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
      authorName: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      quote: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
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

    // Add indexes
    await queryInterface.addIndex('Testimonial', ['businessPk']);
    await queryInterface.addIndex('Testimonial', ['rating']);
    await queryInterface.addIndex('Testimonial', ['sortOrder']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Testimonial');
  }
};
