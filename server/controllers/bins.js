const uuidv4 = require('uuid').v4;
const {db} = require('../fb.js');

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
        last_weight: weight,
        last_distance: distance,
        bin_area: bin_area
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
    const delta_weight = weight - bin.data().last_weight;
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
        await binDocRef.update({
            last_weight: weight,
            last_distance: distance
        });
        res.status(200).send(`${delta_weight} weight added for bin: ${bin_id}`);
    } else {
        res.status(200).send('Bag removed, no garbage recorded.');
    }

    //Update last update values for bin.
    const docRef = db.collection('bins').doc(bin_id);
    await docRef.update({
        last_distance: distance,
        last_weight: weight
    });
};

module.exports = {registerBin, binUpdate};