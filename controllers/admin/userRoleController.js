const { Op } = require("sequelize");
const UserRole = require("../../models").UserRole;


module.exports = {

    async getAllUserRoles(req, res) {
        /*  #swagger.tags = ['Admin/userRole'] */
        try {
            const UserRoleCollection = await UserRole.findAll({});

            let response = {
                data: UserRoleCollection,
            };

            res.status(201).json(response);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async getUserRole(req, res) {
        /*  #swagger.tags = ['Admin/userRole'] */
        try {
            const UserRoleCollection = await UserRole.findOne({
                where: { id: req.params.id },
            });

            let response = {
                data: UserRoleCollection,
            };

            res.status(201).json(response);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async create(req, res) {
        /*  #swagger.tags = ['Admin/userRole'] */
        try {
            const { userId, roleId } = req.body;

            // Validate if user exist in our database
            try {
                const oldUserRole = await UserRole.findOne(
                    {
                        where: {
                            [Op.and]: [{ userId }, { roleId }]
                        }
                    }
                );
                if (oldUserRole) {
                    return res
                        .status(409)
                        .send("Duplicate Entry");
                }
            } catch (e) {
                res.status(500).json({ error: e.message });
            }

            // Create role in our database
            const userRole = await UserRole.create({
                userId,
                roleId
            });

            res.status(200).json({
                userRole,
                message: "UserRole Created successfully",
            });
        } catch (e) {
            res.status(500).json({
                message: e.message,
            });
        }
    },

    async update(req, res) {
        /*  #swagger.tags = ['Admin/userRole'] */
        try {
            const UserRoleCollection = await UserRole.findOne({ where: { id: req.params.id } })

            const { userId, roleId } = req.body;

            const oldUserRole = await UserRole.findOne(
                {
                    where: {
                        [Op.and]: [{ userId }, { roleId }]
                    }
                }
            );
            if (oldUserRole) {
                return res
                    .status(409)
                    .send("Please make some changes");
            }

            if (UserRoleCollection) {
                const updatedRole = await UserRole.update(req.body, {
                    where: { id: req.params.id },
                    returning: true,
                });

                res.status(200).json({
                    updatedRole,
                    message: "UserRole Updated successfully",
                });
            } else {
                res.sendStatus(404, "UserRole Not Found");
            }
        } catch (e) {
            res.status(500).json({
                message: e.message,
            });
        }
    },

    async delete(req, res) {
        /*  #swagger.tags = ['Admin/userRole'] */
        try {
            const UserRoleCollection = await UserRole.findOne({
                where: { id: req.params.id },
            });
            if (UserRoleCollection) {
                const deletedUserRole = await UserRole.destroy({
                    where: { id: req.params.id },
                });
                res.status(200).json({
                    deletedUserRole,
                    message: "UserRole Deleted successfully",
                });
            } else {
                res.sendStatus(404, "UserRole Not Found");
            }
        } catch (e) {
            res.status(500).json({
                message: e.message,
            });
        }
    },

};
