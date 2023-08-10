"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Permission extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Permission.init(
        {
            permissionName: {
                type: DataTypes.STRING(32),
                allowNull: false,
                validate: {
                    notNull: { args: true, msg: "permissionName is required" },
                    len: {
                        args: [3, 30],
                        msg: "Please provide atleast 3 characters.",
                    },
                },
            },
            permissionDescription: {
                type: DataTypes.STRING(64),
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: "permissionDescription is required",
                    },
                    len: {
                        args: [3, 30],
                        msg: "Please provide atleast 3 characters.",
                    },
                },
            },
        },
        {
            sequelize,
            modelName: "Permission",
        }
    );
    return Permission;
};
