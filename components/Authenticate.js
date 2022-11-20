import { useSigninCheck, useUser } from 'reactfire';
import useComponentWithFirebase from '../hooks/useComponentWithFirebase';
import LogoutUser from '../libs/logoutUser.js';
import SignInWithGoogle from '../libs/signInWithGoogle';
const UserInfo = () => { 
  const { status, data: user } = useUser();

  if (status === 'loading') {
    return <span>loading...</span>
  }
  
  return <>
    <h1>Welcome Back, {user.displayName}!</h1>
  </>
}
function Authenticate() { 
   const { status, data: signInCheckResult } = useSigninCheck();

  if (status === 'loading') {
    return <span>loading...</span>
  }

  if (signInCheckResult.signedIn === true) {
    return <>
      <UserInfo/>
      <button onClick={LogoutUser}>Logout</button>
    </>;
  } else {
     return <button onClick={() => { 
      SignInWithGoogle();
    }}>SignIn</button>
  }
}

export default  function AuthenticateWithFirebase () { 
  return useComponentWithFirebase('auth', Authenticate, {})
}

