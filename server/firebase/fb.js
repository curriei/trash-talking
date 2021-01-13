const admin = require('firebase-admin/lib/index');

//IAM Service Account Key Json (not added to git)
const service_account = require('./trashtalking-96ed8-88707e3f8626.json');

admin.initializeApp({
    credential: admin.credential.cert(service_account)
});

const db = admin.firestore();

module.exports = {admin, db};