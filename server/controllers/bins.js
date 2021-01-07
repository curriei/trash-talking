const registerBin = (req, res) => {
    const body_json = req.body;
    const bin_id = body_json.id;
    //add bin
    res.send(`Bin with ID ${bin_id} added.`);
};

const binUpdate = (req, res) => {
    const body_json = req.body;
    const {bin_id} = req.params;
    const weight = body_json.weight;
    const distance = body_json.distance;
    const time = body_json.time;
    const date = body_json.date;
    res.send(`Bin update completed for bin ${bin_id}`);
};

module.exports = {registerBin, binUpdate};