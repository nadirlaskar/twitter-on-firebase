import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreDocData } from "reactfire";
import { getFirebaseInstance } from "./useComponentWithFirebase";

const useFollowSuggestions = () => {
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const user = getFirebaseInstance('auth')?.currentUser;
  const firestore = getFirebaseInstance('firestore');
  const ref = doc(firestore, 'users', user?.uid || 'me');
  const { status: userDataStatus, data: userData, error } = useFirestoreDocData(ref, {
    idField: 'id',
  });
  useEffect(() => {
    if (userDataStatus === 'success') {
      const ref = collection(firestore, 'users');
      const q = userData?.id ? query(ref, where('id', '!=', userData.id)) : query(ref);
      getDocs(q).then((snapshot) => {
        let data = snapshot.docs.map((doc) => doc.data());
        data = data.filter((user) => !userData?.following.includes(user.id));
        setSuggestions(data);
        setLoadingSuggestions(false);
      });
    }
  }, [userDataStatus, userData]);
  return [loadingSuggestions, suggestions];
}

export default useFollowSuggestions;