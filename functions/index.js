const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
admin.firestore().settings({ignoreUndefinedProperties: true});

const addUserToFireStore = (user) => {
  const handle = user.email.replace(/@.+/g, "");
  return admin.firestore()
      .collection("users")
      .doc(user.uid)
      .create({
        name: user.displayName,
        email: user.email,
        handle: handle,
        photoURL: user.photoURL,
        role: "user",
        isActive: true,
        joined: {
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
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
  let {name, bio, dob, location, profession} = data;
  const uid = context.auth.uid;
  const userRef = admin.firestore().collection("users").doc(uid);
  const user = await userRef.get();
  if (!user.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  if (user.data().dob) {
    dob = user.data().dob;
  }
  await userRef.update({name, bio, dob, location, profession});
  return {message: "Profile updated successfully"};
});
