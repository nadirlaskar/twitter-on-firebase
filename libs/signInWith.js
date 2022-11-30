import { GoogleAuthProvider, signInWithPopup, TwitterAuthProvider } from "firebase/auth";
import { getFirebaseInstance } from "../hooks/useComponentWithFirebase";

export const SignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  provider.setCustomParameters({
    prompt: 'select_account',
    'auth_type': 'reauthenticate'
  })
  try {
    const result = await signInWithPopup(getFirebaseInstance('auth'), provider);
    return result;
  } catch (err) { 
    console.error(err);
  }
}
export const SignInWithTwitter = async () => {
  const provider = new TwitterAuthProvider();
  try {
    await signInWithPopup(getFirebaseInstance('auth'), provider);
  } catch (err) {
    console.error(err);
  }
}

export default SignInWithGoogle;