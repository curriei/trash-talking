const {db} = require('../firebase/fb.js');
const dateFns = require('date-fns');

//Helper function called by both exported modules.
const performQuery = async (bins, timeStart, timeEnd) => {
    let values = [];
    const garbageRef = db.collection('data-entries');

    for (const doc of bins) {
        const garbageQuery = await garbageRef
            .where('bin_id', '==', doc)
            // .where('time_stamp', '>=', timeStart)
            // .where('time_stamp', '<=', timeEnd)
            .orderBy('time_stamp').get();
        garbageQuery.forEach(val => {
            values.push(val.data());
        });
    }

    return values;
};

//Return garbage entries themselves
const garbageEntries = async (req, res) => {
    const uid = req.uid.uid;
    const timeStart = req.body.time_start;
    const timeEnd = req.body.time_end;
    let bins = req.body.bins;

    //No bin specified, or * specified.  Query for all bins registered with uid.
    if (bins === undefined || bins === '*') {
        const binRef = db.collection('bins');
        const binQuery = await binRef.where('user_id', '==', uid).get();

        if (binQuery.empty) {
            return res.status(200).send('User has no registered bins');
        }

        bins = [];
        binQuery.forEach(doc => bins.push(doc.id));

    }
    // One bin specified, will be of type string representing binId.
    else if (typeof bins === "string") {
        const bin = await db.collection('bins').doc(bins).get();
        if (!bin.exists) return res.status(400).send(`Bin ${bins} does not exist.`);
        if (!bin.data().user_id === uid) return res.status(400).send(`User not permitted to view bin with ID: ${bins}`);
        bins = [bins];
    }
    // Multiple bins specified, go through each binId in bins.
    else {
        for (const binId of bins) {
            const bin = await db.collection('bins').doc(binId).get();
            if (!bin.exists) return res.status(400).send(`Bin ${binId} does not exist.`);
            if (!bin.data().user_id === uid) return res.status(400).send(`User not permitted to view bin with ID: ${binId}`);
            bins.push(binId);
        }
    }

    const entries = await performQuery(bins, timeStart, timeEnd);

    if (entries.length === 0) {
        return res.status(200).send("No data entries found.");
    }
    res.status(200).send(entries);
};


//Returns totals for the amount per increment
const garbageQuery = async (req, res) => {
    const uid = req.uid.uid;
    const timeStart = parseInt(req.body.time_start);
    const timeEnd = parseInt(req.body.time_end);
    const interval = req.body.interval;
    let bins = req.body.bins;

    //No bin specified, or * specified.  Query for all bins registered with uid.
    if (bins === undefined || bins === '*') {
        const binRef = db.collection('bins');
        const binQuery = await binRef.where('user_id', '==', uid).get();

        if (binQuery.empty) {
            return res.status(200).send('User has no registered bins');
        }

        bins = [];
        binQuery.forEach(doc => bins.push(doc.id));

    }
    // One bin specified, will be of type string representing binId.
    else if (typeof bins === "string") {
        const bin = await db.collection('bins').doc(bins).get();
        if (!bin.exists) return res.status(400).send(`Bin ${bins} does not exist.`);
        if (!bin.data().user_id === uid) return res.status(400).send(`User not permitted to view bin with ID: ${bins}`);
        bins = [bins];
    }
    // Multiple bins specified, go through each binId in bins.
    else {
        for (const binId of bins) {
            const bin = await db.collection('bins').doc(binId).get();
            if (!bin.exists) return res.status(400).send(`Bin ${binId} does not exist.`);
            if (!bin.data().user_id === uid) return res.status(400).send(`User not permitted to view bin with ID: ${binId}`);
            bins.push(binId);
        }
    }

    const entries = await performQuery(bins, timeStart, timeEnd);
    if (entries.length === 0) return res.status(204).send('No data entries found.');


    //Switch on interval to build up categories of intervals to put data in.
    const queryInterval = {start: new Date(timeStart), end: new Date(timeEnd)};
    let subIntervalBreaks = [];
    let result = {
        interval_type: (interval ? interval : 'all'),
        data: {}
    };
    let lastDay;
    switch (interval) {
        case 'day':
            subIntervalBreaks = dateFns.eachDayOfInterval(queryInterval);
            if (subIntervalBreaks.length === 0) {
                subIntervalBreaks = [queryInterval['start'], queryInterval['end']];
                break;
            }
            lastDay = new Date(subIntervalBreaks[subIntervalBreaks.length - 1]);
            subIntervalBreaks.push(dateFns.addDays(lastDay, 1));
            break;
        case 'week':
            subIntervalBreaks = dateFns.eachWeekOfInterval(queryInterval);
            if (subIntervalBreaks.length === 0) {
                subIntervalBreaks = [queryInterval['start'], queryInterval['end']];
                break;
            }
            lastDay = new Date(subIntervalBreaks[subIntervalBreaks.length - 1]);
            subIntervalBreaks.push(dateFns.addWeeks(lastDay, 1));
            break;
        case 'month':
            subIntervalBreaks = dateFns.eachMonthOfInterval(queryInterval);
            if (subIntervalBreaks.length === 0) {
                subIntervalBreaks = [queryInterval['start'], queryInterval['end']];
                break;
            }
            lastDay = new Date(subIntervalBreaks[subIntervalBreaks.length - 1]);
            subIntervalBreaks.push(dateFns.addMonths(lastDay, 1));
            subIntervalBreaks.push(subIntervalBreaks[subIntervalBreaks.length - 1].addMonths(1));
            break;
        case 'year':
            subIntervalBreaks = dateFns.eachYearOfInterval(queryInterval);
            if (subIntervalBreaks.length === 0) {
                subIntervalBreaks = [queryInterval['start'], queryInterval['end']];
                break;
            }
            lastDay = new Date(subIntervalBreaks[subIntervalBreaks.length - 1]);
            subIntervalBreaks.push(dateFns.addYears(lastDay, 1));
            break;
        default:
            subIntervalBreaks = [queryInterval['start'], queryInterval['end']];
    }

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
        }
    }

    res.status(200).json(result);
};

module.exports = {garbageEntries, garbageQuery};