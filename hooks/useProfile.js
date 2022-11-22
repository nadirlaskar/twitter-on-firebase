import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useFirestoreCollectionData, useUser } from 'reactfire';

const useProfile = (profileHandle) => { 
  if (profileHandle === 'me') { 
    const { status, data: user } = useUser();
    return [status, user]
  }
  const firestore = useFirestore();
  const ref = collection(firestore, 'users');
  const q = query(ref, where('handle', '==', profileHandle));
  const { status: profileDataStatus, data: profileData } = useFirestoreCollectionData(q, {
    idField: 'id',
  });
  return [profileDataStatus, profileData?profileData[0]:null]
}

export default useProfile;