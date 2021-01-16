const admin = require('firebase-admin/lib/index');

//IAM Service Account Key Json (not added to git)
const service_account = require(`./${process.env.GOOGLE_OAUTH_FILE}`);

admin.initializeApp({
    credential: admin.credential.cert(service_account)
});

const db = admin.firestore();

module.exports = {admin, db};