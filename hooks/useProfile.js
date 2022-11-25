import { collection, getFirestore, query, where } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useFirestoreCollectionData, useUser } from 'reactfire';

const useProfile = (handle) => { 
  console.log('useProfile', handle);
  const { status, data: user } = useUser();
  let profileHandle = handle || '';
  if ((profileHandle === 'me' || !profileHandle) && user) { 
    profileHandle = user?.email.replace(/@.+/g, '');
  }
  const functions = getFunctions();
  const firestore = getFirestore();
  const updateProfile = httpsCallable(functions, 'updateProfile');
  const ref = collection(firestore, 'users');
  const q = query(ref, where('handle', '==', profileHandle));
  const { status: profileDataStatus, data: profileData } = useFirestoreCollectionData(q, {
    idField: 'id',
    initialData: [],
  });
  if (!profileHandle || status==='loading') return ['loading', null];
  let userInfo = profileData?.length > 0 ? (profileData[0]) : (null);
  return [profileDataStatus, userInfo, updateProfile]
}

export default useProfile;