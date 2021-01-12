const {db} = require('../fb.js');

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

//TODO: Add get method to retrieve latest data for garbage production of user.
//TODO: Restructure firestore into hierarchical structure.

module.exports = {getUser};