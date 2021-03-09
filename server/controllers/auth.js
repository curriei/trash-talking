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

    if (userId === undefined || firstName === undefined || lastName === undefined || email === undefined || password === undefined)
        return res.status(400).json({
            action: "Failed",
            description: "Required inputs are undefined. Check documentation"
        });

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
                console.log("Error in /users/new: ", error);
                res.status(500).json({
                    action: "Failure",
                    description: "Error creating new user,",
                    error: error
                });
            }
        );
};

const loginUser = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.GOOGLE_API_KEY}`;

    if (email === undefined)
        return res.status(400).json({
            action: "Failed",
            description: "Email undefined"
        });
    if (password === undefined)
        return res.status(400).json({
            action: "Failed",
            description: "Password undefined"
        });

    axios.post(url, {
        email: email,
        password: password
    })
        .then(response => {
            console.log(response.data.localId + " has just signed in.");
            const token = jwt.sign({uid: response.data.localId}, process.env.TOKEN_SECRET);
            res.status(200).json({
                action: "Success",
                description: "Login successful.",
                token: token,
                user_id: response.data.localId
            });
        })
        .catch(error => {
            console.log("Invalid login attempt:", error);
            res.status(400).json({
                action: "Failed",
                description: "Invalid credentials or other firebase error.",
                error: error
            });
        });
};

const verifyToken = (req, res, next) => {
    const token = req.header('token');
    if (!token) return res.status(401).json({
        action: "Connection refused",
        description: 'No token specified. Access denied.'
    });

    try {
        req.user = jwt.verify(token, process.env.TOKEN_SECRET);
        next();
    } catch (e) {
        res.status(400).json({
            action: "Connection refused",
            description: 'Invalid token'
        });
    }
};

const verifyAdmin = (req, res, next) => {
    const adminPassword = req.header('admin_password');
    if (!adminPassword) return res.status(401).json({
        action: "Failure",
        description: "No admin_password specified. Access denied."
    });

    if (adminPassword === process.env.ADMIN_PASSWORD) next();
    else res.status(400).json({
        action: "Failure",
        description: 'Incorrect password'
    });
};

const deleteUser = async (req, res) => {
    const userId = req.user.uid;
    try {
        await admin.auth().deleteUser(userId);
        db.collection('users').doc(userId).delete();
        db.collection('goals').where('user_id', '==', userId).delete();
        db.collection('friendships').where('user_1', '==', userId).delete();
        db.collection('friendships').where('user_2', '==', userId).delete();
        const binQuery = await db.collection('bins').where('user_id', '==', userId).get();
        binQuery.forEach((bin) => {
            db.collection('data-entries').where('bin_id', '==', bin.id).delete();
        });
        db.collection('bins').where('user_id', '==', userId).delete();
    } catch (err) {
        return res.status(500).json({action: "Failure", description: "Generic Firestore error.", error: err});
    }
    return res.status(200).json({action: "Success", description: "All data deleted for user"});

};

module.exports = {createUser, verifyToken, loginUser, verifyAdmin, deleteUser};