const {db} = require('../firebase/fb.js');

const performQuery = async (bins, dateStart, dateEnd) => {
    let values = [];
    const garbageRef = db.collection('data-entries');
    bins.forEach(
        async doc => {
            const garbageQuery = await garbageRef
                .where('bin_id', '==', doc.id)
                .where('date', '>=', dateStart)
                .where('date', '<=', dateEnd)
                .orderBy('date')
                .orderBy('time').get();
            garbageQuery.forEach(val => values.push(val));
        });
    return values;
};

//Return garbage entries themselves
const garbageEntries = async (req, res) => {
    const uid = req.uid.uid;
    const dateStart = req.body.date_start;
    const dateEnd = req.body.date_end;
    let bins = req.body.bins;

    if (bins === undefined || (bins.length === 1 && bins[0] === '*')) {
        const binRef = db.collection('bins');
        const binQuery = await binRef.where('user_id', '==', uid).get();

        if (binQuery.empty()) {
            return res.status(204).send('User has no registered bins');
        }

        bins = binQuery.map(doc => doc.id);
    } else {
        bins.forEach(async binId => {
            const bin = await db.collection('bins').doc(binId).get();
            if (!bin.data().user_id === uid) return res.status(400).send(`User not permitted to view bin with ID: ${binId}`);
        });
    }

    const entries = await performQuery(bins, dateStart, dateEnd);

    if (entries.length === 0) return res.status(204).send('No data entries found.');
    res.status(200).send(entries);
};


const totals = (entries, startDate, endDate) => {
    let totalWeight = 0;
    let totalVolume = 0;
    entries.forEach(entry => {
        totalWeight += entry.weight;
        totalVolume += entry.volume;
    });
    return {weight: totalWeight, volume: totalVolume};
};

//Returns totals for the amount per increment
const garbageQuery = async (req, res) => {
    const uid = req.uid.uid;
    const dateStart = req.body.date_start;
    const dateEnd = req.body.date_end;
    let bins = req.body.bins;

    if (bins === undefined || (bins.length === 1 && bins[0] === '*')) {
        const binRef = db.collection('bins');
        const binQuery = await binRef.where('user_id', '==', uid).get();

        if (binQuery.empty) {
            return res.status(204).send('User has no registered bins');
        }

        bins = binQuery.map(doc => doc.id);
    } else {
        bins.forEach(async binId => {
            const bin = await db.collection('bins').doc(binId).get();
            if (!bin.data().user_id === uid) return res.status(400).send(`User not permitted to view bin with ID: ${binId}`);
        });
    }
    const entries = await performQuery(bins, dateStart, dateEnd);
    if (entries.length === 0) return res.status(204).send('No data entries found.');


};

module.exports = {garbageEntries, garbageQuery};