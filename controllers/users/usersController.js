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
const forgotPasswordFileData = fs.readFileSync(
    path.resolve(__dirname, "../../public/forgot-password.ejs"),
    { encoding: "utf-8" }
);

dotenv.config();

module.exports = {
    async getAllUsers(req, res) {
        try {
            /*  #swagger.tags = ['User'] */
            const userCollection = await User.findAll({ include: ["role"] });

            let response = {
                data: userCollection,
            };

           return res.status(201).json(response);
        } catch (e) {
           return res.status(500).json({ error: e.message });
        }
    },

    async getUser(req, res) {
        /*
        @swagger
            path:
            /api/users/
            get:
            summary: Lists all the users
            tags: [Users]
            responses:
                "200":
                description: The list of users.
                content:
                application/json:
                  schema:
                     $ref: '#/components/schemas/users'
        */
        try {
            /*  #swagger.tags = ['User'] */
            const userCollection = await User.findOne({
                include: ["role"],
                where: { id: req.params.id },
            });

            let response = {
                data: userCollection,
            };

           return res.status(201).json(response);
        } catch (e) {
           return res.status(500).json({ error: e.message });
        }
    },

    async getLogin(req, res) {
        try {
            /*  #swagger.tags = ['User'] */
            const { email, password } = req.body;

            const user = await User.findOne({
                where: { email: email },
                include: ["role"],
            });

            if (!user) {
               return res.status(500).json({ message: "User not found!" });
            }

            if (user.isEmailVerified != "1") {
               return res.status(401).send({
                    message: "Pending Account. Please Verify Your Email!",
                });
            }

            if (bcrypt.compareSync(password, user.password)) {
                const token = jwt.sign({ user }, process.env.TOKEN_SECRET, {
                    expiresIn: "24h",
                });

               return res.status(200).json({
                    user,
                    token,
                    message: "User Login successfully",
                });
            } else {
               return res.status(401).json({
                    message: "Invalid Credentials",
                });
            }
        } catch (e) {
           return res.status(500).json({ error: e.message });
        }
    },

    async create(req, res) {
        // Our register logic starts here
        try {
            res.setHeader('Content-Type', 'application/xml')
            /*  #swagger.tags = ['User']
                #swagger.description = 'Endpoint to add a user.' */

            const { email } = req.body;

            // Validate if user exist in our database

            const existingUser = await User.findOne({ where: { email: email } });

            if (existingUser) {
                return res
                    .status(409)
                    .json({ message: "User Already Exist. Please Login" });
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
                       return res.status(500).json({ error: e.message });
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
                       return res.status(500).json({ error: e.message });
                    }
                }
            }

            updated_user = updated_user[1][0];

            //send email to user
            if (user.isEmailVerified == "0") {
                let result = emailVerification(updated_user.dataValues);
            }
            // #swagger.responses[201] = { description: 'User registered successfully.' }
            res.status(200).json({
                updated_user,
                role: role,
                message: "User Created successfully",
            });
        } catch (e) {
           return res.status(500).json({ error: e.message });
        }
    },

    async update(req, res) {
        try {
            /*  #swagger.tags = ['User'] */
            if (req.body.password != '' && req.body.password != null) {
                req.body.password = await bcrypt.hash(req.body.password, 10);
            }

            const userCollection = await User.findOne({
                where: { id: req.params.id },
            });

            if (userCollection) {
                const updateduser = await User.update(req.body, {
                    where: { id: req.params.id },
                    returning: true,
                });

               return res.status(200).json({
                    updateduser,
                    message: "User Updated successfully",
                });
            } else {
                res.sendStatus(404, "User Not Found");
            }
        } catch (e) {
           return res.status(500).json({ error: e.message });
        }
    },

    async delete(req, res) {
        try {
            /*  #swagger.tags = ['User'] */
            const userCollection = await User.findOne({
                where: { id: req.params.id },
            });
            if (userCollection) {
                const deleteduser = await User.destroy({
                    where: { id: req.params.id },
                });
               return res.status(200).json({
                    deleteduser,
                    message: "User Deleted successfully",
                });
            } else {
                res.sendStatus(404, "User Not Found");
            }
        } catch (e) {
           return res.status(500).json({ error: e.message });
        }
    },

    async verifyUser(req, res) {
        /*  #swagger.tags = ['User'] */
        let user = await User.findOne({
            where: { verifyToken: req.params.id },
        });

        if (!user) {
           return res.status(500).json({ message: "Invalid Token" });
        } else if (user.dataValues.isEmailVerified == "1") {
           return res.status(200).json({ message: "Already verified" });
        } else {
            const updatedUser = await User.update(
                {
                    isEmailVerified: "1",
                },
                { where: { verifyToken: req.params.id } }
            );

           return res.status(200).json({ message: "Verified Successfully" });
        }
    },

    async logout(req, res) {
        /*  #swagger.tags = ['User'] */
        const bearerHeader = req.headers["authorization"];
        var bearerToken;
        if (typeof bearerHeader !== "undefined") {
            const bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];
        }

        token = req.headers["x-access-token"] || bearerToken;
        jwt.sign(
            token,
            process.env.TOKEN_SECRET,
            { expiresIn: "1" },
            (logout, err) => {
                if (logout) {
                    res.send({ msg: "You have been Logged Out" });
                } else {
                    res.send({ msg: "Error" });
                }
            }
        );
    },

    async forgotPassword(req, res) {
        try {
            /*  #swagger.tags = ['User'] */
            const email = req.body.email;

            let user = await User.findOne({ where: { email: email } });

            if (!user) {
                return res
                    .status(500)
                    .json({ message: "User with this email does not exist" });
            }

            const token = jwt.sign(
                { _id: user.id },
                process.env.RESET_PASSWORD_SECRET + user.password,
                { expiresIn: "15m" }
            );

            const transporter = nodemailer.createTransport({
                host: process.env.HOST,
                port: process.env.PORT,
                secure: false,
                auth: {
                    user: process.env.NAME,
                    pass: process.env.PASSWORD,
                },
            });

            let updateUser = await User.update(
                { resetLinkToken: token },
                {
                    where: { id: user.id },
                    returning: true,
                }
            );

            if (!updateUser) {
                return res
                    .status(500)
                    .json({ message: "Reset password link error" });
            } else {
                try {
                    await transporter.sendMail({
                        from: '"Fred Foo 👻" <pinlearn@example.com>', // sender address
                        to: email,
                        subject: "Reset Account Password Link",
                        html: ejs.render(forgotPasswordFileData, {
                            user: updateUser[1][0].dataValues,
                        }),
                    });

                   return res.status(200).json({
                        message: "You will get the email soon!",
                    });
                } catch (e) {
                   return res.status(500).json({ message: e.message });
                }
            }
        } catch (e) {
           return res.status(500).json({ error: e.message });
        }
    },

    async resetPassword(req, res) {
        const { token, password } = req.body;

        if (token) {
            let user = await User.findOne({ where: { resetLinkToken: token } });
            if (!user) {
                return res
                    .status(400)
                    .json({ message: "User with this token does not exist" });
            }

            jwt.verify(
                token,
                user.dataValues.resetLinkToken,
                async (error, decodedData) => {
                    if (error) {
                        return res
                            .status(400)
                            .json({
                                error: "Incorrect token or it is expired",
                            });
                    }

                    $updateUser = await User.update(
                        { password: password },
                        {
                            where: { id: user.id },
                            returning: true,
                        }
                    );

                    if (!$updateUser) {
                        return res
                            .status(400)
                            .json({ error: "Reset Password Error" });
                    } else {
                        return res
                            .status(200)
                            .json({
                                message: "Your password has been changed",
                            });
                    }
                }
            );
        } else {
            return res.status(401).json({ error: "Authentication Error" });
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
        //return res.status(500).send(e.message);
    }
};
