import { collection, doc, getDoc, getDocs, limitToLast, orderBy, query, where } from "firebase/firestore";
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
      const onMeSuccess = (doc) => { 
        console.debug(meRef.path, doc.metadata.fromCache ? ": cache" : ":  server");
        const userData = doc.data();  
        const usersRef = collection(firestore, 'users');
        const q = userData?.id
          ? query(usersRef, where('id', '!=', userData.id), orderBy('id', 'asc'), orderBy('followers', 'desc'), limitToLast(10))
          : query(ref,  orderBy('id', 'asc'), orderBy('followers', 'desc'), limitToLast(10));
        getDocs(q).then((snapshot) => {
          console.debug(usersRef.path, snapshot.metadata.fromCache ? ":  cache" : ":  server");
          let data = snapshot.docs.map((doc) => doc.data());
          data = data.filter((user) => !userData?.following.includes(user.id));
          setSuggestions(data);
          setLoadingSuggestions(false);
        });
      }
      getDoc(meRef).then(onMeSuccess);
    }
  }, [user?.uid]);
  return [loadingSuggestions, suggestions];
}

export default useFollowSuggestions;