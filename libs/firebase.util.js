import { collection, endAt, getDocs, getFirestore, orderBy, query, startAt } from "firebase/firestore";

export const searchUserByHandleFromFirebase = async (myQ) => {
  const db = getFirestore();
  const ref = collection(db, "users"); 
  const nameQ = query(ref, orderBy('handle'), startAt(myQ), endAt(myQ + '\uf8ff'));
  const handleQ = query(ref, orderBy('name'), startAt(myQ), endAt(myQ+'\uf8ff'));
  const nameQSnapshot = await getDocs(nameQ);
  const handleQSnapshot = await getDocs(handleQ);
  const data = {}
  handleQSnapshot.forEach((doc) => {
    data[doc.id] = ({
      id: doc.id,
      ...doc.data(),
    });
  });
  nameQSnapshot.forEach((doc) => {
    data[doc.id] = ({
      id: doc.id,
      ...doc.data(),
    });
  });
  return Object.values(data);
}