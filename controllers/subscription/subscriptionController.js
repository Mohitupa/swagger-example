const Subscription = require("../../models").Subscription;
const User = require("../../models").User;

const stripe = require("stripe");
const Stripe = stripe(process.env.STRIPE_SECRET_KEY);

module.exports = {

    async getAllSubscription(req, res) {
        try {

            const getCollection = await Subscription.findAll({ })

            let resData = {
                data: getCollection,
            };
            res.status(200).json({ data: resData })
        } catch (e) {
            res.status(500).json({ error: e.message });
        }

    },

    async createCustomer(req, res) {

        try {

            const getCustomerId = await User.findOne({
                where: { id: req.body.user_id },
            });

            var customer_id_data = getCustomerId.dataValues.stripe_customer_id;

            //Create customer at stripe
            if (customer_id_data == null) {

                var customer = await Stripe.customers.create({
                    name: req.body.billing_details.name,
                    email: req.body.billing_details.email,
                    address: req.body.billing_details.address,
                });

                var customer_id = await User.update({
                    stripe_customer_id: customer.id
                }, {
                    where: { id: req.body.user_id }
                });

            }

            //Added payment method to the customer account

            let paymentMethod = await Stripe.paymentMethods.attach(
                req.body.id,
                {
                    customer: customer_id_data == null ? customer.id : customer_id_data
                }
            );

            await Stripe.customers.update(customer_id_data == null ? customer.id : customer_id_data, {
                invoice_settings: {
                    default_payment_method: paymentMethod.id,
                },
            });

            //Making subscription for the customer
            let stripe_subscription = await Stripe.subscriptions.create({
                customer: customer_id_data == null ? customer.id : customer_id_data,
                items: [{ price: "price_1MLhyqLxzcBJVZsXpYo21lDp" }],
                currency: "usd",
            });

            //Storing the subscription details to the database
            let subscription_data = await Subscription.create({
                user_id: req.body.user_id,
                stripe_subscription_id: stripe_subscription.id,
                default_payment_method: 'stripe',
                start_date: new Date(stripe_subscription.start_date * 1000),
                cancel_at_period_end: stripe_subscription.cancel_at_period_end,
                status: stripe_subscription.status,
            });

            let data = {
                subscription_data,
            };

            res.status(201).json(data);

        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async getAllPaymentMethods(req, res) {
        try {
            const getCustomerId = await User.findOne({
                where: { id: req.body.user_id },
            });

            var customer_id_data = getCustomerId.dataValues.stripe_customer_id;

            const paymentMethods = await Stripe.customers.listPaymentMethods(
                customer_id_data,
                { type: 'card' }
            );

            let resData =
                paymentMethods.data;

            res.status(200).json({ data: resData })

        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async subscriptionWebhook(req, res) {

        const endpointSecret = "whsec_Ehwr58hEKDNlSIocAtDKu2B8dAzKhVbf";

        let sig = req.headers["stripe-signature"];

        var event = req.body;

        // try {
        //     event = await Stripe.webhooks.constructEvent(
        //         req.body,
        //         { type: "application/json" },
        //         sig,
        //         endpointSecret
        //     );
        // } catch (err) {

        //     res.status(400).send(`Webhook Error: ${err.message}`);
        //     return;
        // }

        // Handle the event
        switch (event.type) {
            case 'customer.created':
                var customer = event.data.object;

                break;
            case 'customer.deleted':
                var customer = event.data.object;

                break;
            case 'customer.updated':
                var customer = event.data.object;

                break;
            case 'customer.subscription.created':
                var subscription = event.data.object;

                break;
            case 'customer.subscription.deleted':
                var subscription = event.data.object;

                var immediateCancel = await Subscription.update({
                    status: subscription.status,
                    end_date: new Date(subscription.canceled_at * 1000)
                }, {
                    where: { stripe_subscription_id: subscription.id }
                });
                break;
            case 'customer.subscription.updated':
                var subscription = event.data.object;

                var subscriptionCancel = await Subscription.update({
                    status: subscription.status,
                }, {
                    where: { stripe_subscription_id: subscription.id }
                });

                break;
            // ... handle other event types
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 res to acknowledge receipt of the event
        res.json({ received: true });
    },

    async subscriptionCancel(req, res) {

        let user_id = req.body.user_id;

        let subscription_data = await Subscription.findOne({ user_id: user_id });

        try {

            var cancelSubscription = await Stripe.subscriptions.update(
                subscription_data.stripe_subscription_id,
                { cancel_at_period_end: true }
            );

            var endDate = new Date(cancelSubscription.current_period_end * 1000);

            let cancelData = await Subscription.update({
                end_date: new Date(cancelSubscription.current_period_end * 1000),
            },
                {
                    where: { user_id: user_id }
                });

            res.status(200).json({ data: "User's subscription will end at ", endDate })
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

};
