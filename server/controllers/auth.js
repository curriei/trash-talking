const jwt = require('jsonwebtoken');
const {admin, db} = require('../firebase/fb.js');
const axios = require('axios');


const createUser = async (req, res) => {

    //Json manipulation
    const body = req.body;
    const userId = body.user_id;
    const firstName = body.first_name;
    const lastName = body.last_name;
    const email = body.email;
    const password = body.password;
    const joined = new Date().getTime();

    if (userId === undefined)
        res.status(400).send('User ID is undefined');


    admin.auth().createUser({
        uid: userId,
        email: email,
        emailVerified: false,
        password: password,
        disabled: false
    })
        .then(
            async (userRecord) => {

                const userRef = db.collection('users').doc(userId);
                await userRef.set({
                    first_name: firstName,
                    last_name: lastName,
                    joined: joined,
                });

                console.log("New user created:", userRecord.uid);
                res.status(200).json({
                    action: "Success",
                    description: `User ${userId} created.`
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

    if (req.body.email === undefined)
        return res.status(400).json({
            action: "Failed",
            description: "Email undefined"
        });
    if (req.body.password === undefined)
        return res.status(400).json({
            action: "Failed",
            description: "Password undefined"
        });

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
            res.status(400).json({
                action: "Failed",
                description: "Invalid credentials"
            });
        });
};

const verifyToken = (req, res, next) => {
    const token = req.header('token');
    if (!token) return res.status(401).send('No token specified. Access denied.');

    try {
        req.user = jwt.verify(token, process.env.TOKEN_SECRET);
        next();
    } catch (e) {
        res.status(400).send('Invalid token');
    }
};

const verifyAdmin = (req, res, next) => {
    const adminPassword = req.header('admin_password');
    if (!adminPassword) return res.status(401).send("No admin_password specified. Access denied.");

    if (adminPassword === process.env.ADMIN_PASSWORD) next();
    else res.status(400).send('Incorrect password');
};

module.exports = {createUser, verifyToken, loginUser, verifyAdmin};