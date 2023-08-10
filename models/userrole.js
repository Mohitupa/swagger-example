"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class UserRole extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    UserRole.init(
        {
            roleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: { args: true, msg: "lastName is required" },
                    len: {
                        args: [1, 30],
                        msg: "Please provide atleast 1 characters.",
                    },
                },
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: { args: true, msg: "lastName is required" },
                    len: {
                        args: [1, 30],
                        msg: "Please provide atleast 1 characters.",
                    },
                },
            },
        },
        {
            sequelize,
            modelName: "UserRole",
            timestamps: false,
        }
    );
    return UserRole;
};
