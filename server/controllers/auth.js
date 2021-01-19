const jwt = require('jsonwebtoken');
const {admin} = require('../firebase/fb.js');
const axios = require('axios');


const createUser = async (req, res) => {

    //Json manipulation
    const body = req.body;
    const user_id = body.user_id;
    const displayName = body.name;
    const email = body.email;
    const password = body.password;

    admin.auth().createUser({
        uid: user_id,
        email: email,
        emailVerified: false,
        password: password,
        displayName: displayName,
        disabled: false
    })
        .then(
            (userRecord) => {
                console.log("New user created:", userRecord.uid);
                res.status(200).json({
                    action: "Success",
                    description: `User ${username} created.`
                });
            })
        .catch(
            (error) => {
                console.log(`Error creating new user:`, error);
                res.status(400).send(`${error}`);
            }
        );
};

const loginUser = (req, res) => {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.GOOGLE_API_KEY}`;
    axios.post(url, {
        email: req.body.email,
        password: req.body.password
    })
        .then(response => {
            console.log(response.data);
            const token = jwt.sign({uid: response.data.localId}, process.env.TOKEN_SECRET);
            res.status(200).json({
                action: "Success",
                description: "Login successful.",
                token: token
            });
        })
        .catch(error => {
            console.log("Invalid login attempt:", error);
            res.status(400).send("Invalid credentials provided.");
        });
};

const verifyToken = (req, res, next) => {
    const token = req.body.token;
    if (!token) return res.status(401).send('No token specified. Access denied.');

    try {
        req.uid = jwt.verify(token, process.env.TOKEN_SECRET);
        next();
    } catch (e) {
        res.status(400).send('Invalid token');
    }
};

const verifyAdmin = (req, res, next) => {
    const adminPassword = req.body.admin_password;
    if (!adminPassword) return res.status(401).send("No admin_password specified. Access denied.");

    if (adminPassword === process.env.ADMIN_PASSWORD) next();
    else res.status(400).send('Incorrect password');
};

module.exports = {createUser, verifyToken, loginUser, verifyAdmin};