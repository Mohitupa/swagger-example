var express = require("express");
const RoleController = require("./../../controllers/admin/rolesController");
const adminCanAccess = require("../../middleware/admin/adminCanAccess");

var roleRouter = express.Router();

roleRouter.get("", adminCanAccess,RoleController.getAllRoles);

roleRouter.get("/:id", adminCanAccess,RoleController.getRole);

roleRouter.post("/", adminCanAccess,RoleController.create);

roleRouter.put("/:id", adminCanAccess,RoleController.update);

roleRouter.delete("/:id", adminCanAccess,RoleController.delete);

module.exports = roleRouter;
