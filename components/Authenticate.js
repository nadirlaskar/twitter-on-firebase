import { ArrowLeftOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { httpsCallable } from 'firebase/functions';
import router from 'next/router';
import { memo, useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useSigninCheck } from 'reactfire';
import useComponentWithFirebase, { getFirebaseInstance } from '../hooks/useComponentWithFirebase';
import useProfile from '../hooks/useProfile';
import getProfileDataFromPeopleAPI from '../libs/getProfileDataFromPeopleAPI';
import LogoutUser from '../libs/logoutUser.js';
import SignInWithGoogle from '../libs/signInWith';
import Input from './ui-blocks/input';
import Loading from './ui-blocks/loading';
import Modal from './ui-blocks/popup';
const UserInfo = (props) => { 
  const {
    profileHandle,
    showImage = true, showHandle = true, showName = true, showTweetCount = false,
    showLogout = false,
    imageClassNames,
    metaInfoStyles ,
    rootStyles,
    handleStyles,
    nameStyles,
    logoutButtonStyles,
  } = props;
  const [status, user] = useProfile(profileHandle);
  if (status === 'loading' || user===null) {
    return <Loading className={'text-sky-200 w-5 h-5 border-2 m-2'}/>
  }
  const initial = user?.name.split(' ').map((n) => n[0]).join('')
  const fallabckImage = `https://via.placeholder.com/80/OEA5E9/FFFFFF?text=${initial.toUpperCase()}`;
  return (
    <>
      <div className={classNames('relative flex-row inline-flex group', rootStyles)}>
        {showImage && (
          <img width={40} height={40}
            className={
              classNames(
                'rounded-full', 'inline-block ',
                { "mr-2": showHandle || showName || showTweetCount },
                imageClassNames
              )
            }
            src={user.photoURL || fallabckImage}
            alt={user?.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallabckImage
            }}
          />
        )}
        <div className={classNames(
          {
            'hidden lg:inline-block': showLogout,
            'inline-block': !showLogout
          },
          metaInfoStyles
        )}>
          {showName && <div className={classNames('md:leading-3 text-sm md:text-base', nameStyles)}>{user?.name}</div>}
          {showHandle && <div className={classNames('text-sm text-slate-500',handleStyles)}>@{user?.email.replace(/@.+/g, '')}</div>}
          {showTweetCount && <div className='text-xxs leading-3 sm:text-sm text-slate-500 sm:pt-2'>{user?.tweets?.length} Tweets</div>}
        </div>
      </div>

      {showLogout && (
        <button className={classNames(
          'text-slate-500 lg:text-white hover:bg-slate-100 p-2 lg:bg-slate-400 lg:mt-2 lg:p-4 rounded-full lg:hover:bg-sky-600 text-xxs lg:text-sm w-full',
          logoutButtonStyles
        )} onClick={LogoutUser}>
          <ArrowLeftOnRectangleIcon className={classNames(
              {
                'hidden': !showLogout,
                'w-4 h-4 group-hover:visible text-slate-white inline-block ': showLogout
              }
            )}
          />
          <span> Logout</span>
        </button>
      )}
    </>
  )
}

export const ShowUserInfo = (props) => {
  return useComponentWithFirebase('auth', UserInfo, props);
}

export const UserInfoWithCoverPic = ({isEdit, profileHandle = 'me'}) => { 
  return (
    <>
      <img src={'https://picsum.photos/seed/'+profileHandle+'/500/200'} className='w-full h-22 md:h-52 max-h-52' />
      <div className={classNames(
        'ml-4',
        {
          '-mt-20': !isEdit,
          '-mt-12': isEdit
        },
        'inline-block'
      )}>
        <ShowUserInfo
          profileHandle={profileHandle}
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
            'text-black', 'block', 'mt-4'
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
  const functions = getFirebaseInstance('functions');
  const updateProfile = httpsCallable(functions, 'updateProfile');

  if (status === 'loading') {
    return <Loading className={'text-sky-200 w-5 h-5 border-2'}/>
  }

  if (signInCheckResult.signedIn === true) {
    return <>
      <UserInfo rootStyles={'items-center'} profileHandle={'me'} showLogout={true} />
    </>;
  } else {
    return (
      <button
      className={classNames(
        'fixed bottom-0 left-0 rounded-0 right-0 w-full lg:static lg:m-0 md:container md:mx-auto',
        'text-white bg-sky-500 p-4 lg:rounded-full hover:bg-sky-600 text-lg w-full z-40'
        )}
        onClick={() => {
          console.log('signing in');
          SignInWithGoogle().then((res) => { 
            if (res?._tokenResponse?.oauthAccessToken) {
              getProfileDataFromPeopleAPI(res._tokenResponse?.oauthAccessToken).then((res) => { 
                if(res) updateProfile(res);
              });
            }
            router.push('/search');
          });
       }}>
        Sign In
      </button>
  )
  }
}

export default memo(
  function AuthenticateWithFirebase() {
  const WithAuth = () => useComponentWithFirebase('auth', Authenticate, {});
  return useComponentWithFirebase('functions', WithAuth, {});
  }
);

const EditProfileTitle = ({onClose, onSave, isSaving}) => { 
  return (
    <div className='flex justify-between items-center py-4 px-3'>
      <div className='flex items-center'>
        <XMarkIcon className='w-9 h-9 p-2 rounded-full hover:bg-slate-100 mr-4'  onClick={onClose}/>
        <div className='text-xl font-bold'>Edit Profile</div>
      </div>
      <button
        disabled={isSaving}
        onClick={onSave}
        className={classNames(
          'text-sm mr-2 rounded-full text-white px-4 py-2 hover:bg-black/75',
          {
            'bg-black/75 cursor-not-allowed': isSaving,
            'bg-black': !isSaving
          }
        )}
      >
        Save
      </button>
    </div>
  )
}

const ProfileInfoForm = () => {
  const { register, formState : {isSubmitting} } = useFormContext(); // retrieve all hook methods
  const {ref:nameRef, ...nameProps} = register('name');
  const {ref:bioRef, ...bioProps} = register('bio');
  const {ref:locationRef, ...locationProps} = register('location');
  const {ref:websitenRef, ...websitenRefProps} = register('profession');
  const {ref:dobRef, ...dobProps} = register('dob');
  return (
    <fieldset className='flex flex-col p-4' disabled={isSubmitting}>
      <div className='flex flex-col'>
        <Input frdRef={nameRef} label={"Name"} type='text' {...nameProps}/>
      </div>
      <div className='flex flex-col mt-4'>
        <Input frdRef={bioRef} label={"Bio"} multiline={true} {...bioProps}/>
      </div>
      <div className='flex flex-col mt-4'>
         <Input frdRef={locationRef}  label={"Location"} type='text' {...locationProps}/>
      </div>
      <div className='flex flex-col mt-4'>
        <Input frdRef={websitenRef}  label={"Profession"} type='url' {...websitenRefProps}/>
      </div>
      <div className='flex flex-col mt-4'>
        <Input frdRef={dobRef} label={"Birth date"} type='date' disabled {...dobProps}/>
      </div>
    </fieldset>
  )
}

function EditProfile({className, profileHandle}) {
  const [openEditModal, setOpenEditModal] = useState(false);
  const methods  = useForm({
    defaultValues: {
      name: 'John Doe',
    }
  });
  const [_, user, updateProfile] = useProfile(profileHandle);
  const { reset, formState: { isSubmitting } } = methods;
  const onSave = useCallback((data) => {
    return updateProfile(data).then((() => { 
      setOpenEditModal(false);
    }));
  }, [])
  useEffect(() => {
    if (user) {
      let defaultValues = {};
      defaultValues.name = user.name;
      defaultValues.bio = user.bio;
      defaultValues.profession = user.profession;
      defaultValues.dob = user.dob && (new Date(user.dob.year, user.dob.month-1, user.dob.day+1).toISOString().split('T')[0]);
      defaultValues.location = user.location;
      reset({ ...defaultValues });
    }
  }, [user]);
  const toggleEditProfileModal = useCallback(() => { 
    if(isSubmitting) return;
    setOpenEditModal(!openEditModal);
    if(!openEditModal) {
      reset();
    }
  }, [openEditModal, setOpenEditModal, isSubmitting])
  return(
    <>
      <button className={
        classNames(
          'inline-block py-2 px-4 rounded-full border hover:bg-slate-100 text-sm font-bold',
          className
        )}
        onClick={toggleEditProfileModal}
      >
        Edit profile
      </button>
      <Modal
        isOpen={openEditModal}
        onClose={toggleEditProfileModal}
        title={<EditProfileTitle
          isSaving={isSubmitting}
          onClose={toggleEditProfileModal}
          onSave={methods.handleSubmit(onSave)}
        />}>
        <UserInfoWithCoverPic isEdit={true} profileHandle={profileHandle} />
        <div className='relative'>
          <FormProvider {...methods}>
            <ProfileInfoForm />
          </FormProvider>
        </div>
      </Modal>
      
    </>
  )
}

export const EditProfileButton = (props) => {
  return useComponentWithFirebase('auth', EditProfile, props);
};