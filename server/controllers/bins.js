const uuidv4 = require('uuid').v4;
const {db} = require('../firebase/fb.js');

const registerBin = async (req, res) => {
    //Json manipulation
    const body = req.body;
    let binId = body.id;
    if (binId === undefined) {
        binId = uuidv4();
    }
    const userName = body.userName;
    const bin_area = Math.pow((body.diameter / 2.0), 2) * Math.PI;
    const weight = body.weight;
    const distance = body.distance;

    //Update firebase
    const docRef = db.collection('bins').doc(binId);
    await docRef.set({
        user: userName,
        last_weight: 0,
        last_distance: distance,
        bin_area: bin_area,
        bin_weight: weight,
        bin_distance: distance
    });

    console.log(`Bin with ID ${binId} added.`);
    res.status(200).send(`Bin with ID ${binId} added.`);
};

const binUpdate = async (req, res) => {
    //Json Manipulation
    const update_id = uuidv4();
    const body_json = req.body;
    const {bin_id} = req.params;
    const weight = body_json.weight;
    const distance = body_json.distance;
    const time = body_json.time;
    const date = body_json.date;

    //Compare absolutes for delta
    const binDocRef = db.collection('bins').doc(bin_id);
    const bin = await binDocRef.get();

    if (!bin.exists) {
        res.status(404).send("Bin does not exist");
        return
    }
    const delta_weight = weight - bin.data().last_weight - bin.data().bin_weight;
    // Negative because distance is measured from top of bin.
    const delta_distance = bin.data().last_distance - distance;
    const delta_volume = delta_distance * bin.data().bin_area;

    // Only record a garbage update if garbage was added (avoid bag removal)
    if (delta_weight >= 0) {
        const docRef = db.collection('data-entries').doc(update_id);
        await docRef.set({
            bin_id: bin_id,
            weight: delta_weight,
            volume: delta_volume,
            time: time,
            date: date
        });
        res.status(200).send(`${delta_weight} weight added for bin: ${bin_id}`);
    } else {
        res.status(200).send('Bag removed, no garbage recorded.');
    }

    //Update last update values for bin.
    await binDocRef.update({
        last_distance: distance,
        last_weight: weight - bin.data().bin_weight
    });
};

const current = async (req, res) => {
    const uid = req.uid.uid;
    const binId = req.body.binId;

    const bin = await db.collection('bins').doc(binId).get();
    if (!bin.exists) {
        return res.status(404).send("Bin does not exist");
    }
    if (bin.user !== uid) {
        return res.status(403).send('Bin does not belong to this user.');
    }
    const currentWeight = bin.last_weight;
    const currentVolume = (bin.bin_distance - bin.last_distance) * bin.bin_area;

    res.status(200).json({
        currentWeight: currentWeight,
        currentVolume: currentVolume,
    });
};

module.exports = {registerBin, binUpdate, current};