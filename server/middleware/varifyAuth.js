const User = require('../models/User');
const jwt = require('jsonwebtoken');


exports.api = async (req, res, next) => {

    try {

        // if have auth_token in header
        if (req.header('auth_token')) {

            // getting auth_token from header
            const authToken = req.header('auth_token');

            // varify auth token with jwt
            const jwtVarifyToken = jwt.verify(authToken, process.env.SECRET_KEY);

            // find user
            const user = await User.findOne({ _id: jwtVarifyToken._id });

            if (user) {

                // assifn token and user data in request
                req.token = authToken;
                req.user = user;
                return next();

            }

        } else {

            return res.status(400).json({ error: [{ message: "Access Denied!" }] });

        }

    } catch (error) {
        return res
            .status(500)
            .json({
                error: [{
                    message: error.message || "error while authenticating user api!"
                }]
            })
    }
}