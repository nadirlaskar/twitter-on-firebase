import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const instanceFetcherMap = {
  'firestore': getFirestore,
  'auth': getAuth,
  'functions': getFunctions
}

export const getFirebaseInstance = (firebaseType, app) => {
  return instanceFetcherMap[firebaseType](app);
}