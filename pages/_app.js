import { FirebaseAppProvider } from 'reactfire';
import firebaseConfig from '../firebase';
import '../styles/global.css';
export default function App({ Component, pageProps }) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
        <Component {...pageProps} />
    </FirebaseAppProvider>
  );
}