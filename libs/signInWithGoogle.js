import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const SignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(getAuth(), provider);
  } catch (err) { 
    console.error(err);
  }
}
export default SignInWithGoogle;