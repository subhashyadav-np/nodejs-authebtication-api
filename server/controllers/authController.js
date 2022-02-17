const path = require('path');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');


/**
 * check user login
 */

exports.login = async (req, res) => {

    // getting username and password
    var username = req.body.username;
    var password = req.body.password;

    try {

        // matching username or email of client from mongo database
        const user = await User.findOne({
            $or: [
                { email: username },
                { username: username }
            ]
        });

        // if user does not exist in db
        if (!user) return res
            .status(403)
            .json({ error: [{ message: "Cannot find User!" }] });

        // compare client's password with encrypted password in database using BCRYPT
        const varifyPassword = await bcrypt.compare(password, user.password);

        // if passwird does not varify
        if (!varifyPassword) return res
            .status(403)
            .json({ error: [{ message: "Invalid Password!" }] })

        // create token for user and this token has expiry of 60 days
        const token = jwt.sign(
            { _id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "60d" }
        );

        // store token in database
        user.tokens = user.tokens.concat({ token: token });
        const saveToken = await user.save();

        if (saveToken) {

            return res.header('auth_token', token).status(201)
                .json({
                    success: [{
                        message: "Access Granrted!",
                        auth_token: token
                    }]
                });

        }

    } catch (error) {

        return res
            .status(500)
            .json({
                error: [{
                    message: error.message || "An error occured while logging on user api!"
                }]
            })

    }

}


////////////////////
// register user //
///////////////////

exports.register = async (req, res) => {

    // get validation results using express-validator
    const validationResults = validationResult(req);

    // if validation result have error means not empty
    if (!validationResults.isEmpty()) {

        let errors = validationResults.array();

        let errorsMessage = [];

        for (let i = 0; i < errors.length; i++) {
            errorsMessage.push({ message: errors[i].msg })
        }

        return res.status(422).json({ error: errorsMessage });

    }

    // encrypt client's password using BCRYPT
    const salt = await bcrypt.genSalt();
    const hasedPassword = await bcrypt.hash(req.body.password, salt);

    // create new user
    let user = new User({
        fullName: req.body.fullName,
        username: req.body.username,
        email: req.body.email,
        emailVarifiedAt: null,
        password: hasedPassword,
        avatar: null,
    })

    try {

        // save user
        const result = await user.save(user);

        if (result) {

            return res
                .status(201)
                .json({
                    success:
                        [{ message: "User Registered Successfully!" }]
                })

        }

    } catch (error) {

        return res
            .status(500)
            .json({
                error: [{
                    message: error.message || "An error occured while registering an user api!"
                }]
            })

    }

}


/////////////////
// user logout //
/////////////////

exports.logout = async (req, res) => {

    try {

        // deleting current token by filtering array of tokens in db
        req.user.tokens = req.user.tokens.filter((currentElement) => {
            return currentElement.token !== req.token;
        });

        if (await req.user.save()) return res
            .status(200)
            .json({
                success: [{
                    message: "User Access Token Deleted From Database!"
                }]
            });


    } catch (error) {
        return res
            .status(500)
            .json({
                error: [{
                    message: "An error occured while user logging out!"
                }]
            })
    }
}


//////////////////
// update user //
/////////////////

exports.updateUser = async (req, res) => {

    // get validation results using express-validator
    const validationResults = validationResult(req);

    // if validation result have error means not empty
    if (!validationResults.isEmpty()) {

        let errors = validationResults.array();

        let errorsMessage = [];

        for (let i = 0; i < errors.length; i++) {
            errorsMessage.push({ message: errors[i].msg })
        }

        return res.status(422).json({ error: errorsMessage });

    }

    // get values from html form
    const userid = req.user._id;
    const fullName = req.body.fullName;
    const username = req.body.username;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;

    try {

        // find dbUsernames
        const dbUsernames = await User.findOne({ username: username });
        // find dbEmails
        const dbEmails = await User.findOne({ email: email });
        // find dbPhones
        const dbPhones = await User.findOne({ phone: phone });

        // find current user
        const currentUser = await User.findOne({ _id: userid });

        // ckeck username uniqueness
        if (dbUsernames != null && currentUser.username != username) {
            return res
                .status(422)
                .json({
                    error: [{
                        message: "Username already exist!"
                    }]
                })
        }

        // ckeck email uniqueness
        if (dbEmails != null && currentUser.email != email) {
            return res
                .status(422)
                .json({
                    error: [{
                        message: "E-mail address already exist!"
                    }]
                })
        }

        // ckeck dbPhones uniqueness
        if (dbPhones != null && currentUser.phone != phone) {
            return res
                .status(422)
                .json({
                    error: [{
                        message: "Phone number already exist!"
                    }]
                })
        }

        // update user data
        currentUser.fullName = fullName;
        currentUser.username = username;
        currentUser.email = email;
        currentUser.phone = phone;
        currentUser.address = address;

        // save user
        const saveUser = await currentUser.save();

        if (saveUser) {

            return res
                .status(201)
                .json({
                    success:
                        [{ message: "User Updated Successfully!" }]
                })

        }



    } catch (error) {

        return res
            .status(500)
            .json({
                error: [{
                    message: "An error occured while updating user!"
                }]
            })

    }

}


////////////////////////////////////////
// update user/shop profile's picture //
////////////////////////////////////////

exports.updateAvatar = async (req, res) => {

    try {

        const userid = req.user._id;

        const user = await User.findOne({ '_id': userid });

        // get file and its attributes/properties

        // file
        const dpFile = req.files.dp;
        // filename
        const dpFileName = dpFile.name;
        // file size
        const dpSize = dpFile.data.length;
        // file extension
        const dpExtension = path.extname(dpFileName);
        // file uploaded url
        const dpURL = "/uploads/users/profiles/" + user.username + dpExtension;

        // allowed extension
        const allowedExtensions = /png|jpeg|jpg/;

        // check allowed extension
        if (!allowedExtensions.test(dpExtension)) {
            req.flash('error', 'Photo must be png, jpg or jpeg only!');
            return res.redirect('/shop/profile');
        }

        // check file size limit
        if (dpSize > 1 * 1000 * 1000) {
            req.flash('error', 'File must be less than 1 MB!');
            return res.redirect('/shop/profile');
        }

        // move file to server
        await dpFile.mv('.' + dpURL, function (err) {

            // if file uploaded
            if (err == null) {

                // update file url in database
                user.avatar = dpURL;

                // if user saved
                if (user.save()) {

                    return res
                        .status(201)
                        .json({
                            success: [
                                {
                                    message: "Profile Picture Updated Successfully!",
                                    photoURL: dpURL
                                }
                            ]
                        })

                }

            }

        })

    } catch (error) {
        return res
            .status(500)
            .json({
                error: [{
                    message: "An error occured while uploading profile photo!"
                }]
            })
    }
} 