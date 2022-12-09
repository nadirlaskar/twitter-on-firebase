import { collection, doc, endAt, getDoc, getDocs, orderBy, query, startAt, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getFirebaseInstance } from "../hooks/useComponentWithFirebase";

export const searchUserByHandleFromFirebase = async (myQ) => {
  const db = getFirebaseInstance('firestore');
  const ref = collection(db, "users"); 
  const nameQ = query(ref, orderBy('handle'), startAt(myQ), endAt(myQ + '\uf8ff'));
  const handleQ = query(ref, orderBy('name'), startAt(myQ), endAt(myQ+'\uf8ff'));
  const nameQSnapshot = await getDocs(nameQ);
  const handleQSnapshot = await getDocs(handleQ);
  const data = {}
  handleQSnapshot.forEach((doc) => {
    data[doc.id] = ({
      id: doc.id,
      ...doc.data(),
    });
  });
  nameQSnapshot.forEach((doc) => {
    data[doc.id] = ({
      id: doc.id,
      ...doc.data(),
    });
  });
  return Object.values(data);
}

export const followUserFirebase = async (handle) => {
  const functions = getFirebaseInstance('functions');
  const followUser = httpsCallable(functions, 'followUser');
  try {
    const result = await followUser(handle);
    return ['success', result.data];
  }
  catch (err) {
    return ['error', err];
  }
}

export const unfollowUserFirebase = async (handle) => {
  const functions = getFirebaseInstance('functions');
  const unfollowUser = httpsCallable(functions, 'unfollowUser');
  try {
    const result = await unfollowUser(handle);
    return ['success', result.data];
  }
  catch (err) {
    return ['error', err];
  }
}

export const loadUserProfiles = async (ids) => {
  // load user profiles from firestore
  const db = getFirebaseInstance('firestore');
  const ref = collection(db, "users");
  const q = query(ref, where('id', 'in', ids));
  const qSnapshot = await getDocs(q);
  const data = {}
  qSnapshot.forEach((doc) => {
    data[doc.id] = ({
      id: doc.id,
      ...doc.data(),
    });
  });
  return Object.values(data);
}

export const sendTweet = async (tweet, replyTo = null) => {
  const functions = getFirebaseInstance('functions');
  const sendTweet = httpsCallable(functions, 'sendTweet');
  const result = await sendTweet({ tweet, replyRef: replyTo });
  return result.data;
}

const fetchUserFromFireStoreById = async (db, uid) => {
  const userRef = doc(db,"users",uid);
  const user = await getDoc(userRef);
  if (!user.exists) {
    throw new Error("not-found", "User not found");
  }
  return {ref: userRef, data: user.data()};
};

const homeTweetsFromFirestore = async (db, context) => {
  const uid = context.auth?.uid;
  if (!uid) return [];
  const userRef = doc(db, "users", uid);
  const user = await getDoc(userRef)
  if (!user.exists) { 
    throw new Error("not-found", "User not found");
  }
  const notificationDoc = await getDoc(doc(db,"notifications", uid));
  if (!notificationDoc.exists) {
    throw new Error("not-found", "No tweets found");
  }
  const tweets = notificationDoc.data().tweets || [];

  const source = notificationDoc.metadata.fromCache ? "local cache" : "server";
  console.log("Data came from " + source);

  const homeTweets = [];
  await Promise.all(tweets.map(async (tweet) => {
    let retweetedBy = null;
    if (tweet.includes(":")) {
      const [tweetId, retweetedByRef] = tweet.split(":");
      tweet = tweetId;
      retweetedBy = await fetchUserFromFireStoreById(db,retweetedByRef);
    }
    const tweetSnapshot = await getDoc(doc(db,"tweets",tweet))
    const tweetData = tweetSnapshot.data();
    if (retweetedBy) {
      tweetData.retweetedBy = retweetedBy.data;
      if (tweetData.retweetedBy.uid === uid) {
        tweetData.retweetedBy.name = "you";
      }
    }
    tweetData.isLikedByMe = tweetData.likes.includes(uid);
    tweetData.isRetweetedByMe = tweetData.retweets.includes(uid);
    homeTweets.push(tweetData);
  }));
  return homeTweets;
}

// call firebase function getHomeTweets
export const getHomeTweets = async () => {
  const db = getFirebaseInstance('firestore');
  const auth = getFirebaseInstance('auth');
  const result = await homeTweetsFromFirestore(db, { auth: auth.currentUser });
  return {data: result};
}

// call firebase function getHomeTweets
export const getProfileTweets = async (handle = 'me') => {
  const functions = getFirebaseInstance('functions');
  const getProfileTweets = httpsCallable(functions, 'getProfileTweets');
  const result = await getProfileTweets(handle);
  return result;
}

export const likeTweet = async (tweetId) => {
  const functions = getFirebaseInstance('functions');
  const likeTweet = httpsCallable(functions, 'likeTweet');
  const result = await likeTweet(tweetId);
  return result.data;
}

export const retweet = async (tweetId) => {
  const functions = getFirebaseInstance('functions');
  const retweet = httpsCallable(functions, 'retweet');
  const result = await retweet(tweetId);
  return result.data;
}

export const getExploreTweets = async () => {
  const functions = getFirebaseInstance('functions');
  const getExploreTweets = httpsCallable(functions, 'getExploreTweets');
  const result = await getExploreTweets();
  return result;
}
