import Head from 'next/head';
import { FirebaseAppProvider } from 'reactfire';
import firebaseConfig from '../firebase';
import '../styles/global.css';

export default function App({ Component, pageProps }) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Head>
        <meta name="viewport" content="width=device-width, user-scalable=none" />
      </Head>
      <Component {...pageProps} />
    </FirebaseAppProvider>
  );
}