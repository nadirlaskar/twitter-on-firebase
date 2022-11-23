import { collection, getFirestore, query, where } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useFirestoreCollectionData, useUser } from 'reactfire';

const useProfile = (handle) => { 
  const { status, data: user } = useUser();
  let profileHandle = handle;
  if (profileHandle === 'me') { 
    if (user) {
      user.name = user.displayName;
      profileHandle = user?.email.replace(/@.+/g, '');
    }
  }
  if (!profileHandle || status==='loading') return ['loading', null];
  const functions = getFunctions();
  const firestore = getFirestore();
  const updateProfile = httpsCallable(functions, 'updateProfile');
  const ref = collection(firestore, 'users');
  const q = query(ref, where('handle', '==', profileHandle));
  const { status: profileDataStatus, data: profileData } = useFirestoreCollectionData(q, {
    idField: 'id',
  });
  return [profileDataStatus, profileData?profileData[0]:null, updateProfile]
}

export default useProfile;