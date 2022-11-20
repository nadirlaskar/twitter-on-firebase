import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { AuthProvider, useFirebaseApp } from 'reactfire';

const instanceFetcherMap = {
  'firebase': getFirestore,
  'auth': getAuth
}
export default function useComponentWithFirebase(firebaseType, Component, props = {}) {
  const app = useFirebaseApp();
  const instanceFetcher = instanceFetcherMap[firebaseType];
  switch (firebaseType) { 
    case 'firestore': return (
      <FirestoreProvider sdk={instanceFetcher(app)}>
        <Component {...props} />
      </FirestoreProvider>
    )
    case 'auth': return (
      <AuthProvider sdk={instanceFetcher(app)}>
        <Component {...props} />
      </AuthProvider>
    )
  }

}