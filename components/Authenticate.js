import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { useSigninCheck, useUser } from 'reactfire';
import useComponentWithFirebase from '../hooks/useComponentWithFirebase';
import LogoutUser from '../libs/logoutUser.js';
import SignInWithGoogle from '../libs/signInWithGoogle';
import Modal from './ui-blocks/popup';

const UserInfo = ({
  showImage = true, showHandle = true, showName = true, showTweetCount = false,
  imageClassNames,
  metaInfoStyles ,
  rootStyles,
  handleStyles,
  nameStyles,
}) => { 
  const { status, data: user } = useUser();

  if (status === 'loading' || user===null) {
    return <div className='items-center inline-flex'>loading...</div>
  }
  
  return (
    <div className={classNames('flex-row items-center inline-flex', rootStyles)}>
      {showImage && (
        <img width={40} height={40}
          className={
            classNames(
              'rounded-full', 'inline-block',
              { "mr-2 my-4": showHandle || showName || showTweetCount },
              imageClassNames
            )
          }
          src={user.photoURL}
          alt={user.displayName}
        />
      )
      }
      <div className={classNames('inline-block', metaInfoStyles)}>
        {showName && <div className={classNames('leading-3', nameStyles)}>{user.displayName}</div>}
        {showHandle && <div className={classNames('text-sm text-slate-500',handleStyles)}>@{user.email.replace(/@.+/g, '')}</div>}
        {showTweetCount && <div className='text-sm text-slate-500 pt-2'>0 Tweets</div>}
      </div>
    </div>
  )
}

export const ShowUserInfo = (props) => { 
  return useComponentWithFirebase('auth', UserInfo, props)
}

export const UserInfoWithCoverPic = ({isEdit}) => { 
  return (
    <>
      <img src='https://pbs.twimg.com/profile_banners/714176889460432900/1570041174/1500x500' className='w-full h-full' />
      <div className={classNames(
        'relative',
        {
          'bottom-20 left-4': !isEdit,
          'bottom-14 left-4': isEdit
        },
        'inline-block'
      )}>
        <ShowUserInfo
          showImage={true}
          showHandle={!isEdit}
          showName={!isEdit}
          imageClassNames={classNames(
            {
              'w-32': !isEdit,
              'w-28': isEdit,
            },
            'h-auto border-4 border-white rounded-full'
          )}
          metaInfoStyles={classNames(
            {
              'text-xl': !isEdit,
              'text-sm': isEdit
            },
            'text-black', 'block'
          )}
          rootStyles={'flex flex-col items-start'}
          nameStyles={classNames(
            'font-semibold', {
              'leading-6': !isEdit,
              'leading-2': isEdit
          }
          )}
        />
      </div>
    </>
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
      <button className='text-white bg-slate-400 p-4 rounded-full hover:bg-sky-600 text-sm w-full' onClick={LogoutUser}>Logout</button>
    </>;
  } else {
     return <button  className='text-white bg-sky-500 p-4 rounded-full hover:bg-sky-600 text-lg w-full'  onClick={() => { SignInWithGoogle(); }}>Sign In</button>
  }
}

export default  function AuthenticateWithFirebase () { 
  return useComponentWithFirebase('auth', Authenticate, {})
}

function EditProfile({className}) {
  const [openEditModal, setOpenEditModal] = useState(false);
  const toggleEditProfileModal = useCallback(() => { 
    setOpenEditModal(!openEditModal);
  }, [openEditModal, setOpenEditModal])
  return(
    <>
      <button className={
        classNames(
          'inline-block py-2 px-4 rounded-full border hover:bg-slate-100 text-sm font-semibold',
          className
        )}
        onClick={toggleEditProfileModal}
      >
        Edit Profile
      </button>
      <Modal isOpen={openEditModal} onClose={toggleEditProfileModal} title={'Edit Profile'}>
        <UserInfoWithCoverPic isEdit={true} />
      </Modal>
    </>
  )
}

export const EditProfileButton = (props) => { 
  return useComponentWithFirebase('auth', EditProfile, props)
}