'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Add logoUrl column to business_services table
        await queryInterface.addColumn('BusinessService', 'logoUrl', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'URL to the service logo image'
        });

        // Add logoUrl column to testimonials table
        await queryInterface.addColumn('Testimonial', 'logoUrl', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'URL to the customer/company logo image'
        });

        // Add logoUrl column to businesses table
        await queryInterface.addColumn('Business', 'logoUrl', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'URL to the business logo image'
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove logoUrl column from business_services table
        await queryInterface.removeColumn('BusinessService', 'logoUrl');

        // Remove logoUrl column from testimonials table
        await queryInterface.removeColumn('Testimonial', 'logoUrl');

        // Remove logoUrl column from businesses table
        await queryInterface.removeColumn('Business', 'logoUrl');
    }
};
