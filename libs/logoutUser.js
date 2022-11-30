import { getAuth, signOut } from "firebase/auth";
import router from "next/router";

const LogoutUser = () => { 
  const auth = getAuth();
  return signOut(auth).then(() => { 
    router.push('/');
  });
}

export default LogoutUser;