const bcrypt = require("bcrypt");
const User = require("../../models").User;
const Role = require("../../models").Role;
const usersRole = require("../../models").UserRole;
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

const fileData = fs.readFileSync(
    path.resolve(__dirname, "../../public/index.ejs"),
    { encoding: "utf-8" }
);

dotenv.config();

module.exports = {

    async getAllUsers(req, res) {
        /*  #swagger.tags = ['Admin/Users'] */
        try {
            const userCollection = await User.findAll({ include: ["role"] });

            let response = {
                data: userCollection,
            };

            res.status(201).json(response);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async getUser(req, res) {
        /*  #swagger.tags = ['Admin/Users'] */
        try {
            const userCollection = await User.findOne({
                include: ["role"],
                where: { id: req.params.id },
            });

            let response = {
                data: userCollection,
            };

            res.status(201).json(response);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async create(req, res) {
        /*  #swagger.tags = ['Admin/Users'] */
        // Our register logic starts here
        try {
            const { email } = req.body;

            // Validate if user exist in our database
            try {
                const oldUser = await User.findOne({ where: { email: email } });
                if (oldUser) {
                    return res
                        .status(409)
                        .send("User Already Exist. Please Login");
                }
            } catch (e) {
                res.status(500).json({ error: e.message });
            }

            //Encrypt user password
            encryptedPassword = await bcrypt.hash(req.body.password, 10);

            // Create user in our database
            const user = await User.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: encryptedPassword,
            });

            if (user) {
                var role = await Role.findOne({
                    where: { roleName: req.body.role_type },
                });
                if (role) {
                    try {
                        await usersRole.create({
                            userId: user.id,
                            roleId: role.dataValues.id,
                        });
                    } catch (e) {
                        res.status(500).json({ error: e.message });
                    }
                }

                //create random verify token

                let verify_token = crypto.randomBytes(10).toString("hex");

                if (verify_token) {
                    var values = {
                        verifyToken: verify_token,
                    };
                    var selector = {
                        where: {
                            id: user.id,
                        },
                        returning: true,
                    };

                    try {
                        var updated_user = await User.update(values, selector);
                    } catch (e) {
                        res.status(500).json({ error: e.message });
                    }
                }
            }

            updated_user = updated_user[1][0];

            //send email to user
            if (user.isEmailVerified == "0") {
                let result = emailVerification(updated_user.dataValues);
            }

            res.status(200).json({
                updated_user,
                role: role,
                message: "User Created successfully",
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async update(req, res) {
        /*  #swagger.tags = ['Admin/Users'] */
        try {

            if (req.body.password != '' && req.body.password != null) {
                req.body.password = await bcrypt.hash(req.body.password, 10);
            }

            const userCollection = await User.findOne({ where: { id: req.params.id } })

            if (userCollection) {
                const updateduser = await User.update(req.body, {
                    where: { id: req.params.id },
                    returning: true,
                });

                res.status(200).json({
                    updateduser,
                    message: "User Updated successfully",
                });
            } else {
                res.sendStatus(404, "User Not Found");
            }
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    async delete(req, res) {
        /*  #swagger.tags = ['Admin/Users'] */
        try {
            const userCollection = await User.findOne({
                where: { id: req.params.id },
            });
            if (userCollection) {
                const deleteduser = await User.destroy({
                    where: { id: req.params.id },
                });
                res.status(200).json({
                    deleteduser,
                    message: "User Deleted successfully",
                });
            } else {
                res.sendStatus(404, "User Not Found");
            }
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },
};

const emailVerification = async (user, res) => {

    try {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.PORT,
            secure: false,
            auth: {
                user: process.env.NAME,
                pass: process.env.PASSWORD,
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Fred Foo 👻" <pinlearn@example.com>', // sender address
            to: user.email, // list of receivers
            subject: "Please confirm your account",
            html: ejs.render(fileData, { user }),
        });

        return info.messageId;
    } catch (e) {
        // res.status(500).send(e.message);
    }
};
