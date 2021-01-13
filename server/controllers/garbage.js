const {db} = require('../firebase/fb.js');

//REQ.USERNAME and binID is redundant
//TODO: full query with dates.
const garbageQuery = async (req, res) => {
    const uid = req.uid;
    const dateStart = req.body.date_start;
    const dateEnd = req.body.date_end;
    const increment = req.body.increment;
    const binId = req.body.garbage_id;

    console.log(uid);

    const binRef = db.collection('bins');
    const binQuery = await binRef.where('user', '==', uid.uid).get();

    if (binQuery.empty()) {
        return res.status(204).send('User has no registered bins');
    }

    let values = [];
    const garbageRef = db.collection('data-entries');
    binQuery.forEach(
        async doc => {
            const garbageQuery = await garbageRef.where('bin_id', '==', doc.id).get();
            garbageQuery.forEach(val => values.push(val));
        });
    if (values.length === 0) return res.status(204).send('No data entries for this query.');
    res.status(200).send(values);
};

module.exports = {garbageQuery};