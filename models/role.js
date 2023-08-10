"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
            Role.belongsToMany(models.User, {
                through: models.UserRole,
                onDelete: "cascade",
                foreignKey: { name: "roleId", allowNull: false },
                as: "user",
            });
        }
    }
    Role.init(
        {
            roleName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: { args: true, msg: "roleName is required" },
                    len: {
                        args: [3, 30],
                        msg: "Please provide atleast 3 characters.",
                    },
                },
            },
            roleDescription: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: { args: true, msg: "roleDescription is required" },
                    len: {
                        args: [3, 30],
                        msg: "Please provide atleast 3 characters.",
                    },
                },
            },
        },
        {
            sequelize,
            modelName: "Role",
        }
    );
    return Role;
};
