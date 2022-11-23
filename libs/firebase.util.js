import { collection, endAt, getDocs, getFirestore, orderBy, query, startAt } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

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
  const functions = getFunctions();
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
  const functions = getFunctions();
  const unfollowUser = httpsCallable(functions, 'unfollowUser');
  try {
    const result = await unfollowUser(handle);
    return ['success', result.data];
  }
  catch (err) {
    return ['error', err];
  }
}
