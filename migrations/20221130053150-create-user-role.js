'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('UserRoles', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            roleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: 'cascade',
                references: {
                    model: "Roles",
                    key: "id",
                },
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: 'cascade',
                references: {
                    model: "Users",
                    key: "id",
                },
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('UserRoles');
    }
};
