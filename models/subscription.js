'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Subscription extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Subscription.belongsTo(models.User, {
                onDelete: 'cascade',
                foreignKey: {
                    name: "user_id",
                    allowNull: false,
                },
                as: "subscription",
            });
        }
    }
    Subscription.init({
        default_payment_method: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "payment method is required" } },
        },
        stripe_subscription_id: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: { notNull: { msg: "subscription id is required" } },
        },
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
        cancel_at_period_end: DataTypes.BOOLEAN,
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "payment method is required" } },
        },
    }, {
        sequelize,
        modelName: 'Subscription',
        tableName: "subscriptions",
    });
    return Subscription;
};
