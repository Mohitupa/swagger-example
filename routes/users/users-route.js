var express = require("express");
const userController = require("../../controllers/users/usersController");
const userCanAccess = require("../../middleware/users/userCanAccess");
var userRouter = express.Router();

userRouter.get("/", userController.getAllUsers);

userRouter.post("/register", userController.create);

userRouter.post("/login", userController.getLogin);

userRouter.put("/logout",userCanAccess, userController.logout);

userRouter.get("/verify/:id", userController.verifyUser);

userRouter.post("/forgot-password", userController.forgotPassword);

userRouter.post("/reset-password", userController.resetPassword);

userRouter.get("/:id", userController.getUser);

userRouter.put("/:id", userController.update);

userRouter.delete("/:id", userController.delete);

module.exports = userRouter;
