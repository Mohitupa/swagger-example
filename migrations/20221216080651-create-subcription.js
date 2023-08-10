"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("subscriptions", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: 'cascade',
                references: {
                    model: "Users",
                    key: "id",
                },
            },
            default_payment_method: {
                allowNull: false,
                type: Sequelize.STRING,
                defaultValue: 'stripe'
            },
            stripe_subscription_id: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            start_date: {
                allowNull: true,
                type: Sequelize.DATE,
            },
            end_date: {
                allowNull: true,
                type: Sequelize.DATE,
            },
            cancel_at_period_end: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            status: {
                type: Sequelize.ENUM,
                values: ['active', 'canceled', 'pending'],
                defaultValue: 'pending',
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("subscriptiony");
    },
};
