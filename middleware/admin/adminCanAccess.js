const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();

const config = process.env;

const adminCanAccess = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    var bearerToken;
    //check if bearer is undefined
    if (typeof bearerHeader !== "undefined") {
        //split the space at the bearer
        const bearer = bearerHeader.split(" ");
        //Get token from string
        bearerToken = bearer[1];
    }

    token = req.headers["x-access-token"] || bearerToken;

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, config.TOKEN_SECRET);

        if(decoded.user.role[0].roleName.toLowerCase() == 'admin') {
            req.user = decoded.user
            return next();
        }
        else {
            return res.status(403).send("Only Admin Can Access this");
        }

    } catch (err) {
        return res.status(401).send("Invalid Token");
    }

};

module.exports = adminCanAccess;
