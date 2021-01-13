const {db} = require('../firebase/fb.js');

const getUser = async (req, res) => {
    const {user_name} = req.params;
    const docRef = db.collection('users').doc(user_name);
    const user = await docRef.get();
    if (!user.exists) {
        res.status(404).send("User does not exist");
    } else {
        res.status(200).send(user.data());
    }
};

//TODO: Return and set user goals.
const getGoals = async (req, res) => {
    const uid = req.uid;
    res.send("body.username is redundant in this call.")
};
//TODO: Add get method to retrieve latest data for garbage production of user.
//TODO: Restructure firestore into hierarchical structure.

module.exports = {getUser, getGoals};