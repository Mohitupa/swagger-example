const Permission = require("./../../models").Permission;


module.exports = {

    async getAllpermissions(req, res) {
        /*  #swagger.tags = ['Admin/permission'] */
        try {
            const permissionCollection = await Permission.findAll({});

            let response = {
                data: permissionCollection,
            };
            res.status(201).json(response);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async getPermission(req, res) {
        /*  #swagger.tags = ['Admin/permission'] */
        try {
            const permissionCollection = await Permission.findOne({
                where: { id: req.params.id },
            });

            let response = {
                data: permissionCollection,
            };

            res.status(201).json(response);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async create(req, res) {
        /*  #swagger.tags = ['Admin/permission'] */
        try {
            const { name } = req.body;

            // Validate if user exist in our database
            try {
                const oldPermission = await Permission.findOne({ where: { permissionName: name } });
                if (oldPermission) {
                    return res
                        .status(409)
                        .send("Duplicate Entry");
                }
            } catch (e) {
                console.log(e.message);
            }

            // Create role in our database
            const permission = await Permission.create({
                permissionName: req.body.permissionName,
                permissionDescription: req.body.permissionDescription,
            });

            res.status(200).json({
                permission,
                message: "Permission Created successfully",
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async update(req, res) {
        /*  #swagger.tags = ['Admin/permission'] */
        try {
            const permissionCollection = await Permission.findOne({ where: { id: req.params.id } })

            if (permissionCollection) {
                const updatedRole = await Permission.update(req.body, {
                    where: { id: req.params.id },
                    returning: true,
                });

                res.status(200).json({
                    updatedRole,
                    message: "Permission Updated successfully",
                });
            } else {
                res.sendStatus(404, "Permission Not Found");
            }
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async delete(req, res) {
        /*  #swagger.tags = ['Admin/permission'] */
        try {
            const permissionCollection = await Permission.findOne({
                where: { id: req.params.id },
            });
            if (permissionCollection) {
                const deletedPermission = await Permission.destroy({
                    where: { id: req.params.id },
                });
                res.status(200).json({
                    deletedPermission,
                    message: "Permission Deleted successfully",
                });
            } else {
                res.sendStatus(404, "Permission Not Found");
            }
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

};
