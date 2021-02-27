const uuidv4 = require("uuid").v4;
const {db} = require("../firebase/fb.js");
const goalModels = require('../models/goals.js');

//Create new goal
const newGoal = async (req, res) => {
    const body = req.body;

    const userId = req.user.uid;
    const goalId = uuidv4();

    const timeMade = new Date().getTime().getTime();
    const timeDue = new Date(parseInt(body.time_due)).getTime();
    const status = "On track";
    const importance = parseInt(body.importance);
    const category = body.category;
    if (goalModels.categories[category] === undefined)
        return res.status(400).json({
            action: "Failure",
            message: "Goal category must match one of the predefined categories."
        });

    const target = parseInt(body.target);
    const progress = 0;

    const goalDoc = db.collection('goals').doc(goalId);
    await goalDoc.set({
        user_id: userId,
        time_made: timeMade,
        time_due: timeDue,
        status: status,
        importance: importance,
        category: category,
        target: target,
        progress: progress,
        updates: [],
    });
    res.status(200).send('Goal successfully set');
};

//Get goals associated with user
const getGoals = async (req, res) => {
    const userId = req.user.uid;
    const goalQuery = await db.collection('goals').where('user_id', '==', userId).get();
    let result = {};
    goalQuery.forEach(async goal => {
        const status = await goalModels.categories[goal.data().category]['update'](goal, 0, 0);
        result[goal.id] = goalModels.categories[goal.data().category]['display'](goal.data(), status);
    });
    res.status(200).json({
        num_goals: result.length,
        goals: result
    });
};

const newInsight = async (req, res) => {
    const insightId = uuidv4();
    const insightText = req.body.text;
    const insightCreated = new Date().getTime();
    const starts = new Date(parseInt(req.body.starts)).getTime();
    const expires = new Date(parseInt(req.body.expires)).getTime();
    await db.collection('insights').doc(insightId).set({
        expires: expires,
        starts: starts,
        text: insightText,
        created: insightCreated
    });
    res.status(200).json({
        action: "Success",
        message: "Insight successfully added."
    })
};

const getInsights = async (req, res) => {
    const insightQuery = await db.collection('insights')
        .where('expires', '>=', new Date().getTime())
        .where('starts', '<=', new Date().getTime()).get();
    let result = {};
    insightQuery.forEach((doc) => {
        result[doc.id] = doc.data();
    });
    res.status(200).json({
        action: "Success",
        num_insights: result.length,
        insights: result
    });
};


module.exports = {getGoals, newGoal, getInsights, newInsight};