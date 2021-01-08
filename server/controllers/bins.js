const uuidv4 = require('uuid').v4;
const {db} = require('../fb.js');

const registerBin = async (req, res) => {
    //Json manipulation
    const body_json = req.body;
    let bin_id = body_json.id;
    if (bin_id === undefined) {
        bin_id = uuidv4();
    }
    const user_name = body_json.user_name;
    const bin_area = Math.pow((body_json.diameter / 2.0), 2) * Math.PI;
    const weight = body_json.weight;
    const distance = body_json.distance;

    //Update firebase
    const docRef = db.collection('bins').doc(bin_id);
    await docRef.set({
        user: user_name,
        last_weight: weight,
        last_distance: distance,
        bin_area: bin_area
    });

    console.log(`Bin with ID ${bin_id} added.`);
    res.send(`Bin with ID ${bin_id} added.`);
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
    const bin = await db.collection('bins').doc(bin_id).get();

    if (!bin.exists) {
        res.send("Bin does not exist");
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
        res.send(`${delta_weight} weight added for bin: ${bin_id}`);
    } else {
        res.send('Bag removed, no garbage recorded.');
    }

    const docRef = db.collection('bins').doc(bin_id);
    await docRef.update({
        last_distance: distance,
        last_weight: weight
    });
};

module.exports = {registerBin, binUpdate};