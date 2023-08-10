var express = require("express");
const userController = require("../../controllers/admin/usersController");
const adminCanAccess = require("../../middleware/admin/adminCanAccess");

var userRouter = express.Router();

userRouter.get("/",adminCanAccess, userController.getAllUsers);

userRouter.get("/:id",adminCanAccess, userController.getUser);

userRouter.post("/user-create",adminCanAccess, userController.create);

userRouter.put("/:id",adminCanAccess, userController.update);

userRouter.delete("/:id",adminCanAccess, userController.delete);

module.exports = userRouter;
