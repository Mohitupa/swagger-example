var express = require("express");
const UserRoleController = require("./../../controllers/admin/userRoleController");
const adminCanAccess = require("../../middleware/admin/adminCanAccess");

var userRoleRouter = express.Router();

userRoleRouter.get("", adminCanAccess,UserRoleController.getAllUserRoles);

userRoleRouter.get("/:id", adminCanAccess,UserRoleController.getUserRole);

userRoleRouter.post("/", adminCanAccess,UserRoleController.create);

userRoleRouter.put("/:id", adminCanAccess,UserRoleController.update);

userRoleRouter.delete("/:id", adminCanAccess,UserRoleController.delete);

module.exports = userRoleRouter;
