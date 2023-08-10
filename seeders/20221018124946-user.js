"use strict";

/** @type {import('sequelize-cli').Migration} */

const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

module.exports = {
    async up(queryInterface, Sequelize) {
        // Define role data
        const rolesData = [
            {
                roleName: "user",
                roleDescription: "user role",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleName: "admin",
                roleDescription: "admin role",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        // Bulk insert roles
        const [userRole, adminRole] =
            await queryInterface.bulkInsert("Roles", rolesData, {
                returning: true,
            });
        var encryptedPassword = await bcrypt.hash("password", 10);

        const users = [...Array(2)].map((user) => ({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            password: encryptedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        // Bulk insert users

        const [User, Admin] =
            await queryInterface.bulkInsert("Users", users, {
                returning: true,
            });

        const userRoleData = [
            {
                userId: User.id,
                roleId: userRole.id,
            },
            {
                userId: Admin.id,
                roleId: adminRole.id,
            }
        ];

        // Bulk insert roles
        await queryInterface.bulkInsert("UserRoles", userRoleData, {
            returning: true,
        });
    },

    async down(queryInterface, Sequelize) {
        // Delete rows from tables with foreign key references first
        await Promise.all([queryInterface.bulkDelete("UserRoles", null, {})]);
        await Promise.all([
            queryInterface.bulkDelete("users", null, {}),
            queryInterface.bulkDelete("roles", null, {}),
        ]);
    },
};
