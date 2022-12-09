import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { CACHE_SIZE_UNLIMITED, connectFirestoreEmulator, enableIndexedDbPersistence, initializeFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Loading from '../components/ui-blocks/loading';
import firebaseConfig from '../firebase';
import '../styles/global.css';

const initializeFirebase = async  () => {
  const app = initializeApp(firebaseConfig);
  const firestoreDb = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  });
  if (process.env.NODE_ENV !== 'production') {
    connectFirestoreEmulator(firestoreDb, 'localhost', 8080);
    connectAuthEmulator(getAuth(), 'http://localhost:9099');
    connectFunctionsEmulator(getFunctions(app), 'localhost', 5001);
  }
  await enableIndexedDbPersistence(firestoreDb);
}

export default function App({ Component, pageProps }) {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  useEffect(() => {
    initializeFirebase().then(() => {
      setFirebaseInitialized(true);
    });
  }, []);
  if (!firebaseInitialized) return <Loading className={'m-12 w-12 h-12'}/>;
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, user-scalable=none" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}