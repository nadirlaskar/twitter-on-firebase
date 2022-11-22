import { collection, query, where } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useFirestore, useFirestoreCollectionData, useUser } from 'reactfire';

const useProfile = (profileHandle) => { 
  if (profileHandle === 'me') { 
    const { status, data: user } = useUser();
    if(user) user.handle = user?.email.replace(/@.+/g, '');
    return [status, user]
  }
  const firestore = useFirestore();
  const functions = getFunctions();
  const updateProfile = httpsCallable(functions, 'updateProfile');
  const ref = collection(firestore, 'users');
  const q = query(ref, where('handle', '==', profileHandle));
  const { status: profileDataStatus, data: profileData } = useFirestoreCollectionData(q, {
    idField: 'id',
  });
  return [profileDataStatus, profileData?profileData[0]:null, updateProfile]
}

export default useProfile;