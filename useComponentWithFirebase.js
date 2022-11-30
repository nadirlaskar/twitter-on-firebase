import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { useEffect } from 'react';
import { AuthProvider, FirestoreProvider, FunctionsProvider, useFirebaseApp } from 'reactfire';

const instanceFetcherMap = {
  'firestore': getFirestore,
  'auth': getAuth,
  'functions': getFunctions
}
const emulatorFetcherMap = {
  'firestore': {
    connector: connectFirestoreEmulator,
    port: 8080
  },
  'auth': {
    connector: connectAuthEmulator,
    port: 9099
  },
  'functions': {
    connector: connectFunctionsEmulator,
    port: 5001
  }
};
export default function useComponentWithFirebase(firebaseType, Component, props = {}) {
  const app = useFirebaseApp();
  useEffect(() => { 
    if(window) getFirebaseInstance(firebaseType, app);
  },[app])
  switch (firebaseType) { 
    case 'firestore': return (
      <FirestoreProvider sdk={getFirebaseInstance(firebaseType,app)}>
        <Component {...props} />
      </FirestoreProvider>
    )
    case 'auth': return (
      <AuthProvider sdk={getFirebaseInstance(firebaseType,app)}>
        <Component {...props} />
      </AuthProvider>
    )
    case 'functions': return (
      <FunctionsProvider sdk={getFirebaseInstance(firebaseType,app)}>
        <Component {...props} />
      </FunctionsProvider>
    )
  }
}

export const getFirebaseInstance = (firebaseType, app) => {
  const env = process.env.NODE_ENV;
  console.log('getFirebaseInstance', 'env', env);
  if (env === 'development' && typeof window !== 'undefined') {
    const { connector, port} = emulatorFetcherMap[firebaseType];
    const isSetup = window[`emulatorSetup${firebaseType}`] !== 'true';
    console.log('isSetup', isSetup);
    if (isSetup) {
      console.log('connecting to emulator', firebaseType, port);
      if (firebaseType === 'auth') connector(instanceFetcherMap[firebaseType](app), 'http://localhost:' + port);
      else connector(instanceFetcherMap[firebaseType](app), 'localhost', port); 
      window[`emulatorSetup${firebaseType}`] = 'true';
    }
  }
  return instanceFetcherMap[firebaseType](app);
}