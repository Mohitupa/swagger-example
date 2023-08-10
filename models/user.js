"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.belongsToMany(models.Role, {
                through: models.UserRole,
                onDelete: "cascade",
                foreignKey: {
                    name: "userId",
                    allowNull: false,
                },
                as: "role",
            });
            User.hasOne(models.Subscription, {
                onDelete: 'cascade',
                foreignKey: {
                    name: "user_id",
                    allowNull: false,
                },
                as: "subscription",
            });
        }
    }
    User.init(
        {
            firstName: {
                type: DataTypes.STRING(32),
                allowNull: false,
                validate: {
                    notNull: { args: true, msg: "firstName is required" },
                    len: {
                        args: [3, ],
                        msg: "Please provide atleast 3 characters.",
                    },
                },
            },
            lastName: {
                type: DataTypes.STRING(32),
                allowNull: false,
                validate: {
                    notNull: { args: true, msg: "lastName is required" },
                    len: {
                        args: [3, ],
                        msg: "Please provide atleast 3 characters.",
                    },
                },
            },
            email: {
                type: DataTypes.STRING(64),
                allowNull: false,
                unique: true,
                validate: {
                    notNull: { args: true, msg: "email is required" },
                    isEmail: { args: true, msg: "Invalid email" },
                    len: {
                        args: [5,],
                        msg: "Please provide atleast 5 characters.",
                    },
                },
            },
            password: {
                type: DataTypes.STRING(64),
                allowNull: false,
                validate: {
                    notNull: { args: true, msg: "password is required" },

                },
            },
            verifyToken: { type: DataTypes.STRING },
            isEmailVerified: { type: DataTypes.STRING },
            resetLinkToken: { type: DataTypes.STRING },
        },
        {
            sequelize,
            modelName: "User",
        }
    );

    return User;
};
