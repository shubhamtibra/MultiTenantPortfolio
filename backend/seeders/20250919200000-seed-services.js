'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const services = [
            // Plumbing Services
            {
                pk: uuidv4(),
                name: 'Drain Cleaning',
                description: 'Professional drain cleaning services for clogged drains and pipes',
                category: 'Plumbing',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Water Heater Repair',
                description: 'Repair and maintenance of water heaters',
                category: 'Plumbing',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Pipe Installation',
                description: 'New pipe installation and replacement services',
                category: 'Plumbing',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Emergency Plumbing',
                description: '24/7 emergency plumbing services',
                category: 'Plumbing',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // Electrical Services
            {
                pk: uuidv4(),
                name: 'Electrical Wiring',
                description: 'Residential and commercial electrical wiring services',
                category: 'Electrical',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Panel Upgrades',
                description: 'Electrical panel upgrades and replacements',
                category: 'Electrical',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Lighting Installation',
                description: 'Indoor and outdoor lighting installation',
                category: 'Electrical',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // HVAC Services
            {
                pk: uuidv4(),
                name: 'AC Repair',
                description: 'Air conditioning repair and maintenance',
                category: 'HVAC',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Heating System Installation',
                description: 'Installation of heating systems',
                category: 'HVAC',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Duct Cleaning',
                description: 'Professional duct cleaning services',
                category: 'HVAC',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // Landscaping Services
            {
                pk: uuidv4(),
                name: 'Lawn Maintenance',
                description: 'Regular lawn care and maintenance services',
                category: 'Landscaping',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Tree Trimming',
                description: 'Professional tree trimming and pruning',
                category: 'Landscaping',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Garden Design',
                description: 'Custom garden design and installation',
                category: 'Landscaping',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // Cleaning Services
            {
                pk: uuidv4(),
                name: 'House Cleaning',
                description: 'Residential house cleaning services',
                category: 'Cleaning',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Office Cleaning',
                description: 'Commercial office cleaning services',
                category: 'Cleaning',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Deep Cleaning',
                description: 'Thorough deep cleaning services',
                category: 'Cleaning',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // Construction Services
            {
                pk: uuidv4(),
                name: 'Home Renovation',
                description: 'Complete home renovation services',
                category: 'Construction',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Kitchen Remodeling',
                description: 'Kitchen renovation and remodeling',
                category: 'Construction',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                pk: uuidv4(),
                name: 'Bathroom Remodeling',
                description: 'Bathroom renovation and remodeling',
                category: 'Construction',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await queryInterface.bulkInsert('Service', services);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Service', null, {});
    }
};
