import { getAuth, signOut } from "firebase/auth";

const LogoutUser = () => { 
  const auth = getAuth();
  return signOut(auth);
}

export default LogoutUser;