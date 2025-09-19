'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WebsiteProfile', {
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
      subdomain: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customDomain: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.addIndex('WebsiteProfile', ['businessPk']);
    await queryInterface.addIndex('WebsiteProfile', ['subdomain']);
    await queryInterface.addIndex('WebsiteProfile', ['customDomain']);
    await queryInterface.addIndex('WebsiteProfile', ['subdomain'], {
      unique: true,
      name: 'unique_subdomain'
    });
    await queryInterface.addIndex('WebsiteProfile', ['customDomain'], {
      unique: true,
      name: 'unique_custom_domain',
      where: {
        customDomain: {
          [Sequelize.Op.ne]: null
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WebsiteProfile');
  }
};
