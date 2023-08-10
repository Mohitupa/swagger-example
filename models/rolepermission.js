"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class RolePermission extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    RolePermission.init(
        {
            roleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: { args: true, msg: "roleId is required" },
                    len: {
                        args: [1, 30],
                        msg: "Please provide atleast 1 characters.",
                    },
                },
            },
            permissionId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: { args: true, msg: "permissionId is required" },
                    len: {
                        args: [1, 30],
                        msg: "Please provide atleast 1 characters.",
                    },
                },
            },
        },
        {
            sequelize,
            modelName: "RolePermission",
            timestamps: false,
        }
    );
    return RolePermission;
};
