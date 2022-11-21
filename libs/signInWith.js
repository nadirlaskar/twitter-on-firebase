import { getAuth, GoogleAuthProvider, signInWithPopup, TwitterAuthProvider } from "firebase/auth";

export const SignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(getAuth(), provider);
  } catch (err) { 
    console.error(err);
  }
}
export const SignInWithTwitter = async () => {
  const provider = new TwitterAuthProvider();
  try {
    await signInWithPopup(getAuth(), provider);
  } catch (err) {
    console.error(err);
  }
}

export default SignInWithGoogle;