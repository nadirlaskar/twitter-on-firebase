import { collection, endAt, getDocs, getFirestore, orderBy, query, startAt, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getFirebaseInstance } from "../hooks/useComponentWithFirebase";

export const searchUserByHandleFromFirebase = async (myQ) => {
  const db = getFirestore();
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
  const db = getFirestore();
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

// call firebase function getHomeTweets
export const getHomeTweets = async () => {
  const functions = getFirebaseInstance('functions');
  const getHomeTweets = httpsCallable(functions, 'getHomeTweets');
  const result = await getHomeTweets();
  return result;
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
