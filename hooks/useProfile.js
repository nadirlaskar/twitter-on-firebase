import { collection, getDocs, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import { getFirebaseInstance } from './useComponentWithFirebase';
import useSigninCheck from './useSignInCheck';

const useProfile = (handle) => {
  const { status, data: { user } } = useSigninCheck();
  const [profileData, setProfileData] = useState(null);
  const [profileDataStatus, setProfileDataStatus] = useState('loading');
  let profileHandle = handle || '';
  if ((profileHandle === 'me' || !profileHandle) && user) { 
    profileHandle = user?.email.replace(/@.+/g, '');
  }
  const functions = getFirebaseInstance('functions');
  const updateProfile = httpsCallable(functions, 'updateProfile');
  useEffect(() => { 
    const firestore = getFirebaseInstance('firestore');
    const ref = collection(firestore, 'users');
    const q = query(ref, where('handle', '==', profileHandle));
    getDocs(q).then((snapshot) => {
      if (snapshot.docs.length > 0) {
        setProfileData(snapshot.docs.map((doc) => doc.data()));
        setProfileDataStatus('success');
      }
    });

  }, [profileHandle]);
  if (!profileHandle || status==='loading') return ['loading', null];
  let userInfo = profileData?.length > 0 ? (profileData[0]) : (null);
  return [profileDataStatus, userInfo, updateProfile]
}

export default useProfile;