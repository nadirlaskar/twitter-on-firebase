import classNames from 'classnames';
import { useSigninCheck, useUser } from 'reactfire';
import useComponentWithFirebase from '../hooks/useComponentWithFirebase';
import LogoutUser from '../libs/logoutUser.js';
import SignInWithGoogle from '../libs/signInWithGoogle';
const UserInfo = ({
  showImage = true, showHandle = true, showName = true, showTweetCount = false,
  imageClassNames = [],
  metaInfoStyles = [],
  rootStyles = []
}) => { 
  const { status, data: user } = useUser();

  if (status === 'loading' || user===null) {
    return <div className='items-center inline-flex'>loading...</div>
  }
  
  return (
    <div className={classNames('flex-row items-center inline-flex', ...rootStyles)}>
      {showImage && (
        <img width={40} height={40}
          className={
            classNames(
              'rounded-full', 'inline-block',
              { "mr-2 my-4": showHandle || showName || showTweetCount },
              ...imageClassNames
            )
          }
          src={user.photoURL}
          alt={user.displayName}
        />
      )
      }
      <div className={classNames('inline-block', ...metaInfoStyles)}>
        {showName && <div className='leading-3'>{user.displayName}</div>}
        {showHandle && <div className='text-sm text-slate-500'>@{user.email.replace(/@.+/g, '')}</div>}
        {showTweetCount && <div className='text-sm text-slate-500 pt-2'>0 Tweets</div>}
      </div>
    </div>
  )
}
function Authenticate() { 
   const { status, data: signInCheckResult } = useSigninCheck();

  if (status === 'loading') {
    return <span  className='flex items-center w-full'>loading...</span>
  }

  if (signInCheckResult.signedIn === true) {
    return <>
      <UserInfo />
      <button className='text-white bg-slate-400 p-2 rounded-full hover:bg-sky-400 text-sm w-full' onClick={LogoutUser}>Logout</button>
    </>;
  } else {
     return <button  className='text-white bg-sky-500 p-2 rounded-full hover:bg-sky-600 text-lg w-full'  onClick={() => { SignInWithGoogle(); }}>Sign In</button>
  }
}

export default  function AuthenticateWithFirebase () { 
  return useComponentWithFirebase('auth', Authenticate, {})
}

export const ShowUserInfo = (props) => { 
  return useComponentWithFirebase('auth', UserInfo, props)
}