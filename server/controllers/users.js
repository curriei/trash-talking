const {db} = require('../fb.js');

const createUser = async (req, res) => {

    //Json manipulation
    const body_json = req.body;
    const user_name = body_json.user_name;
    const first = body_json.first_name;
    const last = body_json.last_name;
    const email = body_json.email;
    const date_joined = body_json.date_joined;

    //Set firebase user.
    const docRef = db.collection('users').doc(user_name);
    await docRef.set({
        First_name: first,
        Last_name: last,
        email: email,
        Date_Joined: date_joined
    });
    res.send(`User ${user_name} created.`);
};

const getUser = async (req, res) => {
    const {user_name} = req.params;
    const docRef = db.collection('users').doc(user_name);
    const user = await docRef.get(user_name);
    if (!user.exists) {
        res.send("User does not exist");
    } else {
        res.send(user.data());
    }
};

module.exports = {createUser, getUser};