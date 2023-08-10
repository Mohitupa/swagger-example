var passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../../models").User;
const Role = require("../../models").Role;
const usersRole = require("../../models").UserRole;
const Subscription = require("../../models").Subscription;
const crypto = require("crypto");
const nodemailer = require("nodemailer");
var facebookStrategy = require("passport-facebook");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var userProfile;
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const jwt = require("jsonwebtoken");

const fileData = fs.readFileSync(
    path.resolve(__dirname, "../../public/index.ejs"),
    { encoding: "utf-8" }
);

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            profileFields: ["id", "displayName", "emails", "photos"],
        },
        function (accessToken, refreshToken, profile, done) {
            userProfile = profile;
            return done(null, userProfile);
        }
    )
);

passport.use(
    new facebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
            profileFields: ["id", "displayName", "emails", "photos"],
        },
        (accessToken, refreshToken, profile, done) => {
            userProfile = profile;
            var user = {};
            done(null, user);
        }
    )
);

module.exports = {
    async callBackFunction(req, res) {
        try {
            // Getting the user details from the callback
            let userEmail;
            userProfile.emails.forEach((data) => {
                userEmail = data.value;
            });

            let splitName = userProfile.displayName.split(" ");

            const temporaryPassword = Math.floor(
                Math.random() * 100000000
            ).toString();

            const bycrtPassword = await bcrypt.hash(temporaryPassword, 10);

            const existingUser = await User.findOne({
                include: [
                    {
                        model: Role,
                        as: "role",
                        attributes: ['id', 'roleName']
                    },
                    {
                        model: Subscription,
                        as: "subscription",
                        attributes: ['start_date', 'end_date', 'status']
                    }
                ],
                where: { email: userEmail },
            });

            //Checking if the user is already registered
            if (existingUser) {

                if (existingUser.isEmailVerified == "0") {

                    var responseHTML = '';
                    responseHTML = await dialogClose();


                    responseHTML = responseHTML.replace(
                        "%value%",
                        JSON.stringify({
                            message: "Your email is not verified", isEmailVerified: false
                        })
                    );

                    return res.status(200).send(responseHTML);

                }

                const token = jwt.sign({ user: existingUser }, process.env.TOKEN_SECRET, {
                    expiresIn: "24h",
                });

                var responseHTML = '';
                responseHTML = await dialogClose();


                responseHTML = responseHTML.replace(
                    "%value%",
                    JSON.stringify({
                        user: existingUser,
                        token,
                        message: "User Login successfully",
                    })
                );

                return res.status(200).send(responseHTML);

            } else {
                // Registering user
                let newUser = await User.create({
                    firstName: splitName[0],
                    lastName: splitName[1],
                    email: userEmail,
                    password: bycrtPassword,
                    role_type: "user",
                });

                if (newUser) {
                    var role = await Role.findOne({
                        where: { roleName: "user" },
                    });
                    if (role) {
                        try {
                            await usersRole.create({
                                userId: newUser.id,
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
                                id: newUser.id,
                            },
                            returning: true,
                        };

                        try {
                            var updated_user = await User.update(
                                values,
                                selector
                            );
                        } catch (e) {
                            return res.status(500).json({ error: e.message });
                        }
                    }
                }

                updated_user = updated_user[1][0];

                //send email to user
                if (newUser.isEmailVerified == "0") {
                    let result = emailVerification(
                        updated_user.dataValues,
                        temporaryPassword
                    );
                }

                // #swagger.responses[201] = { description: 'User registered successfully.' }

                var responseHTML = '';
                responseHTML = await dialogClose();


                responseHTML = responseHTML.replace(
                    "%value%",
                    JSON.stringify({
                        user: updated_user,
                        message: "Please verify your email!",
                        isEmailVerified: false
                    })
                );

                res.status(200).send(responseHTML);
            }
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
};

const emailVerification = async (user, tempPassword, res) => {
    try {
        user["tempPassword"] = tempPassword;
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
            from: '"Fred Foo 👻" <neerajmangoit@gmail.com>', // sender address
            to: user.email, // list of receivers
            subject: "Please confirm your account",
            html: ejs.render(fileData, { user }),
        });

        return info.messageId;
    } catch (e) {
        console.log(e);
        // return res.status(500).send(e.message);
    }
};

const dialogClose = async () => {
    return `<html>
                <head>
                    <title>Main</title>
                </head>
                <body></body>
                <script>res = %value%; window.opener.postMessage(res, "*");window.close();</script>
            </html>`;
}
