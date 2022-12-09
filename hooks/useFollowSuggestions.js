import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getFirebaseInstance } from "./useComponentWithFirebase";

const useFollowSuggestions = () => {
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const user = getFirebaseInstance('auth')?.currentUser;
  useEffect(() => {
    if (user?.uid) {
      const firestore = getFirebaseInstance('firestore');
      const meRef = doc(firestore, 'users', user?.uid || 'me');
      getDoc(meRef).then((doc) => { 
        const userData = doc.data();  
        const usersRef = collection(firestore, 'users');
        const q = userData?.id ? query(usersRef, where('id', '!=', userData.id)) : query(ref);
        getDocs(q).then((snapshot) => {
          let data = snapshot.docs.map((doc) => doc.data());
          data = data.filter((user) => !userData?.following.includes(user.id));
          setSuggestions(data);
          setLoadingSuggestions(false);
        });
      });
    }
  }, [user?.uid]);
  return [loadingSuggestions, suggestions];
}

export default useFollowSuggestions;