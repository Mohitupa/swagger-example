const Role = require("../../models").Role;

module.exports = {

    async getAllRoles(req, res) {
        /*  #swagger.tags = ['Admin/roles'] */
        try {
            const roleCollection = await Role.findAll({});
            let response = {
                data: roleCollection,
            };

            res.status(201).json(response);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async getRole(req, res) {
        /*  #swagger.tags = ['Admin/roles'] */
        try {
            const roleCollection = await Role.findOne({
                where: { id: req.params.id },
            });

            let response = {
                data: roleCollection,
            };

            res.status(201).json(response);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async create(req, res) {
        /*  #swagger.tags = ['Admin/roles'] */
        try {
            const { name } = req.body;

            // Validate if user exist in our database
            try {
                const oldRole = await Role.findOne({ where: { roleName: name } });
                if (oldRole) {
                    return res
                        .status(409)
                        .send("Duplicate Entry");
                }
            } catch (e) {
                res.status(500).json({ error: e.message });
            }

            // Create role in our database
            const role = await Role.create({
                roleName: req.body.roleName,
                roleDescription: req.body.roleDescription,
            });

            res.status(200).json({
                role,
                message: "Role Created successfully",
            });
        } catch (e) {
            res.status(500).json({
                message: e.message,
            });
        }
    },

    async update(req, res) {
        /*  #swagger.tags = ['Admin/roles'] */
        try {
            const roleCollection = await Role.findOne({ where: { id: req.params.id } })

            if (roleCollection) {
                const updatedRole = await Role.update(req.body, {
                    where: { id: req.params.id },
                    returning: true,
                });

                res.status(200).json({
                    updatedRole,
                    message: "Role Updated successfully",
                });
            } else {
                res.sendStatus(404, "Role Not Found");
            }
        } catch (e) {
            res.status(500).json({
                message: e.message,
            });
        }
    },

    async delete(req, res) {
        /*  #swagger.tags = ['Admin/roles'] */
        try {
            const roleCollection = await Role.findOne({
                where: { id: req.params.id },
            });
            if (roleCollection) {
                const deletedRole = await Role.destroy({
                    where: { id: req.params.id },
                });
                res.status(200).json({
                    deletedRole,
                    message: "Role Deleted successfully",
                });
            } else {
                res.sendStatus(404, "Role Not Found");
            }
        } catch (e) {
            res.status(500).json({
                message: e.message,
            });
        }
    },

};
