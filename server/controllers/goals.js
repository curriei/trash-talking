const uuidv4 = require("uuid").v4;
const {db} = require("../firebase/fb.js");
const goalModels = require('../models/goals.js');

//Create new goal
const newGoal = async (req, res) => {
    const body = req.body;

    const userId = req.user.uid;
    const goalId = uuidv4();

    try {
        const timeMade = new Date().getTime();
        const timeDue = new Date(parseInt(body.time_due)).getTime();
        const status = "On track";
        const importance = parseInt(body.importance);
        if (importance < 1 || importance > 3)
            return res.status(400).json({
                action: "Failure",
                message: "Importance must be between 1 and 3"
            });
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
        res.status(200).json({
            action: "Success",
            description: 'Goal successfully set'
        });
    } catch (err) {
        console.log("Uncaught error in /goals/new: ", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error, likely due to firestore.",
            error: err
        })
    }
};

//Get goals associated with user
const getGoals = async (req, res) => {
    const userId = req.user.uid;

    try {
        const goalQuery = await db.collection('goals').where('user_id', '==', userId).get();
        const goals = [];
        goalQuery.forEach(goal => {
            goals.push(goal);
        });
        const result = {};
        for (const goal of goals) {
            const status = await goalModels.categories[goal.data().category]['update'](goal, 0, 0);
            result[goal.id] = goalModels.categories[goal.data().category]['display'](goal.data(), status);
        }
        res.status(200).json({
            num_goals: Object.keys(result).length,
            goals: result
        });
    } catch (err) {
        console.log("Uncaught error in /goals: ", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error, likely due to firestore.",
            error: err
        })
    }
};

const newInsight = async (req, res) => {
    //Req.body: text, starts, expires
    const insightId = uuidv4();
    const insightText = req.body.text;
    const startsNum = req.body.starts;
    const expiresNum = req.body.expires;
    const insightCreated = new Date().getTime();
    let insightLink = req.body.link;
    const insightTitle = req.body.title;

    if (insightText === undefined || insightTitle === undefined)
        return res.status(400).json({
            action: "Failure",
            description: "No text or title provided."
        });
    if (insightLink === undefined)
        insightLink = "";

    try {
        const starts = new Date(parseInt(startsNum)).getTime();
        const expires = new Date(parseInt(expiresNum)).getTime();
        await db.collection('insights').doc(insightId).set({
            expires: expires,
            starts: starts,
            text: insightText,
            link: insightLink,
            created: insightCreated,
            title: insightTitle
        });
        res.status(200).json({
            action: "Success",
            message: "Insight successfully added."
        });
    } catch (err) {
        console.log("Uncaught error in /goals/insights/new: ", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error, likely due to firestore.",
            error: err
        })
    }
};

const getInsights = async (req, res) => {
    try {
        //req body is empty
        const insightQuery = await db.collection('insights')
            .where('expires', '>=', new Date().getTime()).get();
        let result = {};
        insightQuery.forEach((doc) => {
            if (doc.data().starts <= new Date().getTime())
                result[doc.id] = doc.data();
        });
        res.status(200).json({
            action: "Success",
            num_insights: result.length,
            insights: result
        });
    } catch (err) {
        console.log("Uncaught error in /goals/insights: ", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error, likely due to firestore.",
            error: err
        })
    }
};


module.exports = {getGoals, newGoal, getInsights, newInsight};