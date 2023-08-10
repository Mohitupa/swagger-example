var express = require("express");
var router = express.Router();

//user
const usersRouter = require("./users/users-route");
const userSocial = require("./users/user-social-route");

//admin
const adminUsersRouter = require("./admin/users-route");
const adminRolesRouter = require("./admin/role-route");
const adminPermissionsRouter = require("./admin/permission-route");
const adminUserRoleRouter = require("./admin/user-role-route");

//subscription
const subscriptionRoute = require("./subscription/subscription-route");

//main-route
router.get("/", (req, res) => {
    res.status(200).json({
        content: " Welcome 🙌 ",
        status: 200,
        headers: req.headers["authorization"],
        user: req.user,
    });
});

//Subscription Routes
router.use("/subscription", subscriptionRoute);

//users routes

router.use("/user", usersRouter);
router.use("/auth", userSocial);

//admin Routes

router.use("/admin", adminUsersRouter);

router.use("/admin/role", adminRolesRouter);

router.use("/admin/permission", adminPermissionsRouter);

router.use("/admin/userRole", adminUserRoleRouter);

module.exports = router;
