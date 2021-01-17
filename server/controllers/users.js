const {admin, db} = require('../firebase/fb.js');
const uuidv4 = require('uuid').v4;

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
            res.status(404).send(error);
        });
};

const getBins = async (req, res) => {
    const uid = req.uid.uid;
    const binQuery = await db.collection('bins').where('user_id', '==', uid).get();
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

const getGoals = async (req, res) => {
    const uid = req.uid.uid;
    const goalQuery = await db.collection('goals').where('user_id', '==', uid).get();
    let result = [];
    goalQuery.forEach(goal => {
        console.log(goal);
        result.push(goal.data())
    });
    res.status(200).json({
        num_goals: result.length,
        goals: result
    });
};

const newGoal = async (req, res) => {
    const uid = req.uid.uid;
    const goal_id = uuidv4();
    const goalDoc = db.collection('goals').doc(goal_id);
    goalDoc.set({
        user_id: uid,
        goal_desc: req.body.goal_desc,
        date_made: new Date().toJSON(),
        date_due: req.body.date_due,
        status: 'Incomplete'
    });
    res.status(200).send('Goal successfully set');
};

//TODO: Update and complete goals.

module.exports = {getUser, getGoals, getBins, newGoal};