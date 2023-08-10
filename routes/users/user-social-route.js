var express = require("express");
const userSocialController = require("../../controllers/users/userSocialController");
var userSocialRouter = express.Router();
var passport = require("passport");

userSocialRouter.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
);

userSocialRouter.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/error" }),
    userSocialController.callBackFunction
);

userSocialRouter.get(
    "/facebook",
    passport.authenticate("facebook", { scope: "email" })
);

userSocialRouter.get(
    "/facebook/callback",
    passport.authenticate(
        "facebook",
        {
            failureRedirect: "/failed/login",
        }),
        userSocialController.callBackFunction
);

userSocialRouter.get("/failed/login", (req, res, next) => {
    res.send("login failed");
});

module.exports = userSocialRouter;
