'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OpeningHour', {
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
      dayOfWeek: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 6
        }
      },
      opens: {
        type: Sequelize.TIME,
        allowNull: true
      },
      closes: {
        type: Sequelize.TIME,
        allowNull: true
      },
      closed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.addIndex('OpeningHour', ['businessPk']);
    await queryInterface.addIndex('OpeningHour', ['dayOfWeek']);
    await queryInterface.addIndex('OpeningHour', ['businessPk', 'dayOfWeek'], {
      unique: true,
      name: 'unique_business_day'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OpeningHour');
  }
};
