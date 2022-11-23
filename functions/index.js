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
        id: user.uid,
        name: user.displayName,
        email: user.email,
        handle: handle,
        photoURL: user.photoURL,
        bio: "Just joined Twitter!",
        role: "user",
        following: [],
        followers: [],
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

const fetchUserFromFireStoreByHandle = async (handle) => {
  const userRef = admin.firestore().collection("users");
  const q = userRef.where("handle", "==", handle);
  const querySnapshot = await q.get();
  if (querySnapshot.empty) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  const ref = querySnapshot.docs[0].ref;
  const data = querySnapshot.docs[0].data();
  data.id = querySnapshot.docs[0].id;
  return {ref, data};
};

exports.followUser = functions.https.onCall(async (handle, context) => {
  const uid = context.auth.uid;
  const followerRef = admin.firestore().collection("users").doc(uid);
  const follower = await followerRef.get();
  if (!follower.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  const {
    ref: followingRef,
    data: followingData,
  } = await fetchUserFromFireStoreByHandle(handle);
  const followingList = followingData.following;
  if (followingList.includes(followingData.id)) {
    throw new functions
        .https
        .HttpsError("already-exists", "User already followed");
  }
  await followerRef.update({
    following: admin.firestore.FieldValue.arrayUnion(followingData.id),
  });
  await followingRef.update({
    followers: admin.firestore.FieldValue.arrayUnion(follower.id),
  });
  return {message: "User followed successfully"};
});

exports.unfollowUser = functions.https.onCall(async (handle, context) => {
  const uid = context.auth.uid;
  const followerRef = admin.firestore().collection("users").doc(uid);
  const follower = await followerRef.get();
  if (!follower.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  const {
    ref: followingRef,
    data: followingData,
  } = await fetchUserFromFireStoreByHandle(handle);
  const followersList = followingData.followers;
  if (!followersList.includes(uid)) {
    throw new functions
        .https
        .HttpsError("not-found", "User not followed");
  }
  await followerRef.update({
    following: admin.firestore.FieldValue.arrayRemove(follower.id),
  });
  await followingRef.update({
    followers: admin.firestore.FieldValue.arrayRemove(uid),
  });
  return {message: "User unfollowed successfully"};
});
