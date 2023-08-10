var express = require("express");

const subscriptionController = require("../../controllers/subscription/subscriptionController");

var subscriptionRoute = express.Router();

subscriptionRoute.post("/create-customer",  subscriptionController.createCustomer);

subscriptionRoute.post("/webhook", subscriptionController.subscriptionWebhook);

subscriptionRoute.get("/", subscriptionController.getAllSubscription);

subscriptionRoute.post("/cancel", subscriptionController.subscriptionCancel);

subscriptionRoute.post("/payment-method", subscriptionController.getAllPaymentMethods);

module.exports = subscriptionRoute;
