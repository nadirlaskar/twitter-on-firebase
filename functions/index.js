const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
admin.firestore().settings({ignoreUndefinedProperties: true});

const addUserToFireStore = (user) => {
  return admin.firestore()
      .collection("users")
      .doc(user.uid)
      .create({
        name: user.displayName,
        email: user.email,
        role: "user",
        isActive: true,
      });
};

const deleteUserFromFireStore = (user) => {
  return admin.firestore()
      .collection("users")
      .doc(user.uid)
      .delete();
};

exports.createUserListener = functions.auth.user().onCreate(addUserToFireStore);
exports.deleteUserListener = functions.auth
    .user()
    .onDelete(deleteUserFromFireStore);

exports.updateProfile = functions.https.onCall(async (data, context) => {
  const {name, bio, dob, location, website} = data;
  const uid = context.auth.uid;
  const userRef = admin.firestore().collection("users").doc(uid);
  const user = await userRef.get();
  if (!user.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  await userRef.update({name, bio, dob, location, website});
  return {message: "Profile updated successfully"};
});
