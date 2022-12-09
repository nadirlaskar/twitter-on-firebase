import { useEffect, useState } from "react";
import { getFirebaseInstance } from "./useComponentWithFirebase";

const useSigninCheck = () => {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const auth = getFirebaseInstance('auth');
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setStatus('success');
      } else {
        setUser(null);
        setStatus('signedOut');
      }
    });
    return () => unsubscribe();
  }, [auth]);
  return {
    status,
    data: {
      user,
      signedIn: status === 'success',
    }
};

}

export default useSigninCheck;