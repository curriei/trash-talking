//Goal statuses: Failed, Complete, On track, Not on track
//
const {db} = require("../firebase/fb.js");
const dateFns = require("date-fns");

const updateTotalValueGoal = async (goal, volume, weight, type) => {
    if (goal.data().status === "Complete" || goal.data().status === "Failed")
        return goal.data().status;

    let progress;
    let status;
    if (new Date().getTime() > goal.data().time_due) {
        status = "Complete";
        progress = goal.data().progress;
    } else {
        if (type === "weight")
            progress = goal.data().progress + weight;
        else if (type === "volume")
            progress = goal.data().progress + volume;
        else {
            console.log("Incorrect type argument used in goal update function.");
            return goal.data().status;
        }

        if (progress > goal.data().target) {
            status = "Failed";
        } else {
            status = "On track";
        }
    }
    await db.collection('goals').doc(goal.id).update({
        status: status,
        progress: progress
    });
    return status;
};

const updateAveValueGoals = async (goal, volume, weight, type) => {
    if (goal.data().status === "Complete" || goal.data().status === "Failed")
        return goal.data().status;

    let progress;
    let status;
    if (new Date().getTime() > goal.data().time_due) {
        progress = goal.data().progress;
        const days = (goal.data().time_due - goal.data().time_made) / (1000 * 60 * 60 * 24);
        if (progress / days <= goal.data().target)
            status = "Complete";
        else
            status = "Failed";

    } else {
        if (type === "weight")
            progress = parseFloat(goal.data().progress) + weight;
        else if (type === "volume")
            progress = goal.data().progress + volume;
        else {
            console.log("Incorrect type argument used in goal update function.");
            return goal.data().status;
        }

        const days = (new Date().getTime() - goal.data().time_made) / (1000 * 60 * 60 * 24);
        if (progress / days <= goal.data().target)
            status = "On track";
        else
            status = "Not on track";
    }

    await db.collection('goals').doc(goal.id).update({
        status: status,
        progress: progress
    });
    return status;
};

const updateMaxValueGoal = async (goal, volume, weight, type, timeframe) => {
    //likely using date-fns and progress throughout the week to track
    //new week noticed by last value of goal.data().updates and seeing if its in the previous week.
    if (goal.data().status === "Complete" || goal.data().status === "Failed")
        return goal.data().status;

    const now = new Date();

    let intervalStart;
    switch (timeframe) {
        case "week":
            intervalStart = dateFns.startOfWeek(now);
            break;
        case "month":
            intervalStart = dateFns.startOfMonth(now);
    }
    const lastUpdate = new Date(parseInt(goal.data().updates[goal.data().updates.length - 1]));
    let progress;
    if (intervalStart > lastUpdate) {
        if (type === "weight")
            progress = weight;
        else
            progress = volume;
    } else {
        if (type === "weight")
            progress = goal.data().progress + weight;
        else
            progress = goal.data().progress + volume;
    }
    if (now > goal.data().time_due) {
        status = "Complete";
        progress = goal.data().progress;
    } else if (progress > goal.data().target) {
        status = "Failed";
    } else {
        status = "On track";
    }
    await db.collection('goals').doc(goal.id).update({
        status: status,
        progress: progress
    });
    return status;

};

const displayAverageValueGoals = (goalData, status) => {
    const res = goalData;
    res['status'] = status;
    const days = (new Date().getTime() - goalData.time_made) / (1000 * 60 * 60 * 24);
    res['progress'] = goalData.progress / days;
    return res;
};


//Categories of goals and their corresponding update and display functions.
const categories = {
    total_volume: {
        update: (goal, volume, weight) => {
            return updateTotalValueGoal(goal, volume, weight, "volume")
        },
        display: (goalData, status) => {
            let res = goalData;
            res['status'] = status;
            return res;
        }
    },
    total_weight: {
        update: (goal, volume, weight) => {
            return updateTotalValueGoal(goal, volume, weight, "weight")
        },
        display: (goalData, status) => {
            let res = goalData;
            res['status'] = status;
            return res;
        }
    },
    max_weight_per_week: {
        update: (goal, volume, weight) => {
            return updateMaxValueGoal(goal, volume, weight, "weight", "week")
        },
        display: (goalData, status) => {
            let res = goalData;
            res['status'] = status;
            return res;
        }
    },
    max_volume_per_week: {
        update: (goal, volume, weight) => {
            return updateMaxValueGoal(goal, volume, weight, "volume", "week")
        },
        display: (goalData, status) => {
            let res = goalData;
            res['status'] = status;
            return res;
        }
    },
    max_weight_per_month: {
        update: (goal, volume, weight) => {
            return updateMaxValueGoal(goal, volume, weight, "weight", "month")
        },
        display: (goalData, status) => {
            let res = goalData;
            res['status'] = status;
            return res;
        }
    },
    max_volume_per_month: {
        update: (goal, volume, weight) => {
            return updateMaxValueGoal(goal, volume, weight, "volume", "month")
        },
        display: (goalData, status) => {
            let res = goalData;
            res['status'] = status;
            return res;
        }
    },
    ave_volume_per_day: {
        update: (goal, volume, weight) => {
            return updateAveValueGoals(goal, volume, weight, "volume")
        },
        display: displayAverageValueGoals
    },
    ave_weight_per_day: {
        update: (goal, volume, weight) => {
            return updateAveValueGoals(goal, volume, weight, "weight")
        },
        display: displayAverageValueGoals
    }
};

const updateGoals = async (userId, volume, weight, updateId) => {
    const goals1 = await db.collection('goals').where('user_id', '==', userId).where('status', '==', 'On track').get();
    const goals2 = await db.collection('goals').where('user_id', '==', userId).where('status', '==', 'Not on track').get();


    goals1.forEach(async (goal) => {
        //Handle goal update based on the category which the given goal has.
        await categories[goal.data().category]['update'](goal, volume, weight);
        const updates = goal.data().updates;
        updates.push(updateId);
        await db.collection('goals').doc(goal.id).update({
            updates: updates
        });
    });
    goals2.forEach(async (goal) => {
        //Handle goal update based on the category which the given goal has.
        await categories[goal.data().category]['update'](goal, volume, weight);
        const updates = goal.data().updates;
        updates.push(updateId);
        await db.collection('goals').doc(goal.id).update({
            updates: updates
        });
    });
};

module.exports = {updateGoals, categories};