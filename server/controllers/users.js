const {admin, db} = require('../firebase/fb.js');
const uuidv4 = require('uuid').v4;

//Get User Profile
const getUser = async (req, res) => {
    const userId = req.body.user_id;
    admin.auth().getUser(userId)
        .then((userRecord) => {
            res.status(200).json({
                user_id: userRecord.uid,
                name: userRecord.displayName,
                email: userRecord.email
            });
        })
        .catch((error) => {
            res.status(400).send(error);
        });
};

//Get bins relating to user
const getBins = async (req, res) => {
    const user_id = req.uid.uid;
    const binQuery = await db.collection('bins').where('user_id', '==', user_id).get();
    let result = {};
    let num = 0;
    binQuery.forEach(bin => {
        result[bin.id] = bin.data();
        num++;
    });
    res.status(200).json({
        num_bins: num,
        bins: result
    });
};

//Get goals associated with user
const getGoals = async (req, res) => {
    const user_id = req.uid.uid;
    const goalQuery = await db.collection('goals').where('user_id', '==', user_id).get();
    let result = {};
    goalQuery.forEach(goal => {
        result[goal.id] = goal.data()
    });
    res.status(200).json({
        num_goals: result.length,
        goals: result
    });
};

//Create new goal
const newGoal = async (req, res) => {
    const goalDesc = req.body.goal_desc;
    const timeDue = req.body.time_due;

    const user_id = req.uid.uid;
    const goal_id = uuidv4();
    const goalDoc = db.collection('goals').doc(goal_id);
    goalDoc.set({
        user_id: user_id,
        goal_desc: goalDesc,
        time_made: new Date().getTime(),
        time_due: new Date(parseInt(timeDue)).getTime(),
        status: 'Incomplete'
    });
    res.status(200).send('Goal successfully set');
};

module.exports = {getUser, getGoals, getBins, newGoal};
