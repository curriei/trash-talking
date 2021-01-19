const uuidv4 = require('uuid').v4;
const {db} = require('../firebase/fb.js');

const createBin = async (req, res) => {
    const body = req.body;
    let binArea = body.bin_area;
    if (binArea === undefined)
        binArea = Math.pow((body.diameter / 2.0), 2) * Math.PI;

    const binId = uuidv4();
    await db.collection('bins').doc(binId).set({
        activated: false,
        bin_area: binArea
    });
    console.log('Bin created with ID:', binId);
    res.status(200).send(`Bin created with ID: ${binId}`);
};

const registerBin = async (req, res) => {
    //Json manipulation
    const body = req.body;
    const binId = body.bin_id;
    const binRef = db.collection('bins').doc(binId);

    //Check if bin was created.
    const bin = await binRef.get();
    if (!bin.exists) return res.status(400).send("Bin does not exist.");
    if (bin.data().activated === true) return res.status(400).send('Bin has already been registered.');

    //Register bin.
    const uid = req.uid.uid;

    //Update firebase
    await binRef.update({
        user_id: uid,
        activated: true
    });

    console.log(`Bin with ID ${binId} added.`);
    res.status(200).send(`Bin with ID ${binId} added.`);
};

const binUpdate = async (req, res) => {
    //Json Manipulation
    const update_id = uuidv4();
    const body_json = req.body;
    const binId = body_json.bin_id;
    const weight = body_json.weight;
    const distance = body_json.distance;
    const timeStamp = new Date().getTime();

    //Get bin data and check if exists
    let binDocRef;
    let bin;
    try {
        binDocRef = db.collection('bins').doc(binId);
        bin = await binDocRef.get();
    } catch (e) {
        return res.status(400).send(`Error accessing database: ${e}`);
    }
    if (!bin.exists) {
        res.status(400).send("Bin does not exist");
        return
    }

    //Update bin data, including checking if bin has had any updates in the past yet.
    let lastWeight = bin.data().last_weight;
    let lastDistance = bin.data().last_distance;
    if (lastWeight === undefined) {
        binDocRef.update({
            last_weight: weight,
            last_distance: distance,
            bin_weight: weight,
            bin_distance: distance,
            last_update: timeStamp
        });
        lastDistance = distance;
        lastWeight = weight;
    } else {
        binDocRef.update({
            last_weight: weight,
            last_distance: distance,
            last_update: timeStamp
        })
    }

    //Calculate delta values for garbage update.
    const deltaWeight = weight - lastWeight;
    // Negative because distance is measured from top of bin.
    const deltaDistance = lastDistance - distance;
    const deltaVolume = deltaDistance * bin.data().bin_area;

    // Only record a garbage update if garbage was added (avoid bag removal)
    if (deltaWeight >= 0) {
        const docRef = db.collection('data-entries').doc(update_id);
        await docRef.set({
            bin_id: binId,
            weight: deltaWeight,
            volume: deltaVolume,
            time_stamp: timeStamp
        });
        res.status(200).send(`${deltaWeight} weight added for bin: ${binId}`);
    } else {
        res.status(200).send('Bag removed, no garbage recorded.');
    }
};

const current = async (req, res) => {
    const uid = req.uid.uid;
    const binId = req.body.bin_id;

    const bin = await db.collection('bins').doc(binId).get();

    //Check if bin exists
    if (!bin.exists) {
        return res.status(400).send("Bin does not exist");
    }
    //Check if bin has any data relating to it
    if (bin.data().bin_weight === undefined) {
        return res.status(400).send("Bin has never been updated.");
    }
    //Check if bin matches registered user.
    if (bin.data().user_id !== uid) {
        return res.status(400).send('Bin does not belong to this user.');
    }
    const currentWeight = bin.data().last_weight - bin.data().bin_weight;
    const currentVolume = (bin.data().bin_distance - bin.data().last_distance) * bin.data().bin_area;

    const date = new Date(bin.data().last_update);
    res.status(200).json({
        current_weight: currentWeight,
        current_volume: currentVolume,
        last_update: {
            year: date.getFullYear(),
            month: date.getMonth(),
            date: date.getDate(),
            day: date.getDay(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
            time_stamp: date.getTime(),
            time_zone_offset: date.getTimezoneOffset()
        }
    });
};

module.exports = {registerBin, createBin, binUpdate, current};