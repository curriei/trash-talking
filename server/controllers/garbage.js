const {db} = require('../firebase/fb.js');
const dateFns = require('date-fns');

//Helper function called by both exported modules.
const performQuery = async (bins, timeStart, timeEnd) => {
    let values = [];
    const garbageRef = db.collection('data-entries');

    const garbageQuery = await garbageRef
        .where('bin_id', 'in', bins)
        .where('time_stamp', '>=', timeStart)
        .where('time_stamp', '<=', timeEnd)
        .orderBy('time_stamp').get();

    garbageQuery.forEach(val => {
        values.push(val.data());
    });
    return values;
};


//Helper function used by garbageEntries and garbageQuery to evaluate input body.
const getBins = async (bins, user_id) => {

    let result;
    //No bin specified, or * specified.  Query for all bins registered with user_id.
    if (bins === undefined || bins === '*' || bins === "") {
        const binRef = db.collection('bins');
        const binQuery = await binRef.where('user_id', '==', user_id).get();

        if (binQuery.empty) {
            throw 'User has no registered bins';
        }

        result = [];
        binQuery.forEach(doc => result.push(doc.id));

    }
    // One bin specified, will be of type string representing binId.
    else if (typeof bins === "string") {
        const bin = await db.collection('bins').doc(bins).get();
        if (!bin.exists) throw `Bin ${bins} does not exist.`;
        if (!bin.data().user_id === user_id) throw `User not permitted to view bin with ID: ${bins}`;
        result = [bins];
    }
    // Multiple bins specified, go through each binId in bins.
    else {
        result = [];
        for (const binId of bins) {
            const bin = await db.collection('bins').doc(binId).get();
            if (!bin.exists) throw `Bin ${binId} does not exist.`;
            if (!bin.data().user_id === user_id) throw `User not permitted to view bin with ID: ${binId}`;
            result.push(binId);
        }
    }
    return result;
};

//Return garbage entries themselves
const garbageEntries = async (req, res) => {
    const user_id = req.user.uid;
    const timeStart = parseInt(req.query.time_start);
    const timeEnd = parseInt(req.query.time_end);

    if (isNaN(timeStart) || isNaN(timeEnd))
        return res.status(400).json({action: "Failed", description: "Time constraints not specified or incorrect."});

    let bins;
    try {
        bins = await getBins(req.query.bins, user_id)
    } catch (e) {
        return res.status(400).json({
            action: "Failure",
            description: "Error while finding bins to use",
            error: e
        })
    }

    try {
        const entries = await performQuery(bins, timeStart, timeEnd);
        if (entries.length === 0) {
            return res.status(200).json({
                action: "Success",
                description: "No data entries found."
            });
        }
        res.status(200).json({
            action: "Success",
            num_entries: entries.length,
            data: entries
        });
    } catch (err) {
        console.log("Uncaught error in /garbage/entries: ", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error, likely due to firestore.",
            error: err
        })
    }
};


//Returns totals for the amount per increment
const garbageQuery = async (req, res) => {
    const userId = req.user.uid;
    const timeStart = parseInt(req.query.time_start);
    const timeEnd = parseInt(req.query.time_end);
    const interval = req.query.interval;

    let bins;
    try {
        bins = await getBins(req.query.bins, userId)
    } catch (e) {
        return res.status(400).json({
            action: "Failure",
            description: "Error determining bins to query",
            error: e
        });
    }

    try {
        const entries = await performQuery(bins, timeStart, timeEnd);
        if (entries.length === 0) return res.status(400).json({
            action: "Failure",
            description: 'No data entries found.'
        });

        const result = organizeDataForQuery(timeStart, timeEnd, interval, entries);

        res.status(200).json(result);
    } catch (err) {
        console.log("Uncaught error in /garbage/query: ", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error, likely due to firestore.",
            error: err
        })
    }
};

//Specifically for accessing a query shared by another user.
const sharedQuery = async (req, res) => {
    const userId = req.user.uid;
    const shareId = req.query.share_id;

    if (!shareId)
        return res.status(400).json({action: "Failed", description: "Field share_id in query must not be undefined."});
    const share = await db.collection("shares").doc(shareId).get();
    if (!share.exists)
        return res.status(400).json({action: "Failed", description: "Shared query not found."});
    if (share.data().shared_with !== userId && share.data().sharing_user !== userId)
        return res.status(400).json({action: "Failed", description: "User not allowed to view this shared query."});
    if (share.data().shared_with === userId) {
        await db.collection("shares").doc(shareId).update({
            status: "Viewed"
        });
    }

    const timeStart = share.data().time_start;
    const timeEnd = share.data().time_end;
    const interval = share.data().interval;
    const sharingUser = share.data().sharing_user;
    const attemptedBins = share.data().bins;

    let bins;
    try {
        bins = await getBins(attemptedBins, sharingUser)
    } catch (e) {
        return res.status(400).json({
            action: "Failure",
            description: "Error determining bins to query",
            error: e
        })
    }

    try {
        const entries = await performQuery(bins, timeStart, timeEnd);
        if (entries.length === 0) return res.status(400).json({
            action: "Failure",
            description: 'No data entries found.'
        });

        const result = organizeDataForQuery(timeStart, timeEnd, interval, entries);

        res.status(200).json(result);
    } catch (err) {
        console.log("Uncaught error in /garbage/query/shared: ", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error, likely due to firestore.",
            error: err
        })
    }

};

const organizeDataForQuery = (timeStart, timeEnd, interval, entries) => {

    const queryInterval = {start: new Date(timeStart), end: new Date(timeEnd)};
    let subIntervalBreaks = [];
    let lastDay;

    //Switch on interval to sort entries by day, week, month, or year.
    switch (interval) {
        case 'day':
            subIntervalBreaks = dateFns.eachDayOfInterval(queryInterval);
            if (subIntervalBreaks.length === 0) {
                subIntervalBreaks = [
                    dateFns.startOfDay(queryInterval['start']),
                    dateFns.addMilliseconds(dateFns.endOfDay(queryInterval['end']), 1)
                ];
                break;
            }
            lastDay = new Date(subIntervalBreaks[subIntervalBreaks.length - 1]);
            subIntervalBreaks.push(dateFns.addDays(lastDay, 1));
            break;
        case 'week':
            subIntervalBreaks = dateFns.eachWeekOfInterval(queryInterval);
            if (subIntervalBreaks.length === 0) {
                subIntervalBreaks = [
                    dateFns.startOfWeek(queryInterval['start']),
                    dateFns.addMilliseconds(dateFns.endOfWeek(queryInterval['end']), 1)
                ];
                break;
            }
            lastDay = new Date(subIntervalBreaks[subIntervalBreaks.length - 1]);
            subIntervalBreaks.push(dateFns.addWeeks(lastDay, 1));
            break;
        case 'month':
            subIntervalBreaks = dateFns.eachMonthOfInterval(queryInterval);
            if (subIntervalBreaks.length === 0) {
                subIntervalBreaks = [
                    dateFns.startOfMonth(queryInterval['start']),
                    dateFns.addMilliseconds(dateFns.endOfMonth(queryInterval['end']), 1)
                ];
                break;
            }
            lastDay = new Date(subIntervalBreaks[subIntervalBreaks.length - 1]);
            subIntervalBreaks.push(dateFns.addMonths(lastDay, 1));
            break;
        case 'year':
            subIntervalBreaks = dateFns.eachYearOfInterval(queryInterval);
            if (subIntervalBreaks.length === 0) {
                subIntervalBreaks = [
                    dateFns.startOfYear(queryInterval['start']),
                    dateFns.addMilliseconds(dateFns.endOfYear(queryInterval['end']), 1)
                ];
                break;
            }
            lastDay = new Date(subIntervalBreaks[subIntervalBreaks.length - 1]);
            subIntervalBreaks.push(dateFns.addYears(lastDay, 1));
            break;
        default:
            subIntervalBreaks = [queryInterval['start'], queryInterval['end']];
    }

    let result = {
        interval_type: (interval ? interval : 'all'),
        num_intervals: 0,
        data: {}
    };

    //Sum weight and volume for data entries over sub-interval breaks.
    let i_entries = 0;
    for (let i_interval = 0; i_interval < subIntervalBreaks.length - 1; i_interval++) {
        let interval_weight_sum = 0;
        let interval_volume_sum = 0;
        while (i_entries < entries.length) {
            if (entries[i_entries].time_stamp < subIntervalBreaks[i_interval].getTime()) {
                i_entries++;
                continue;
            }
            if (entries[i_entries].time_stamp > subIntervalBreaks[i_interval + 1].getTime()) break;
            interval_volume_sum += entries[i_entries].volume;
            interval_weight_sum += entries[i_entries].weight;
            i_entries++;
        }

        result['data'][subIntervalBreaks[i_interval].getTime()] = {
            weight: interval_weight_sum,
            volume: interval_volume_sum
        };
        result['num_intervals']++;
    }
    return result;
};

module.exports = {garbageEntries, garbageQuery, sharedQuery};