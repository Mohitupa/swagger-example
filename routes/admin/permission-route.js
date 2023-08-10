var express = require("express");
const PermissionController = require("./../../controllers/admin/permissionController");
const adminCanAccess = require("../../middleware/admin/adminCanAccess");

var permissionRouter = express.Router();

permissionRouter.get("", adminCanAccess,PermissionController.getAllpermissions);

permissionRouter.get("/:id", adminCanAccess,PermissionController.getPermission);

permissionRouter.post("/", adminCanAccess,PermissionController.create);

permissionRouter.put("/:id", adminCanAccess,PermissionController.update);

permissionRouter.delete("/:id", adminCanAccess,PermissionController.delete);

module.exports = permissionRouter;
