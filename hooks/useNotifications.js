import { UserPlusIcon } from "@heroicons/react/24/solid";
import { doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreDocData } from "reactfire";
import LikeIcon from "../components/icons/Like";
import { getFirebaseInstance } from "./useComponentWithFirebase";

const LikeNotification = ({like}) => {
  const initial = like?.name.split(' ').map((n) => n[0]).join('')
  const fallback = `https://via.placeholder.com/80/OEA5E9/FFFFFF?text=${initial.toUpperCase()}`
  const userIcon =  like.photoUrl || fallback;
  return (
    <div className="flex flex-row py-2">
      <LikeIcon filled={true} className='w-10 h-10 mr-2 text-pink-500' />
      <div className="flex flex-col">
        <img src={userIcon} className='w-10 h-10 rounded-full mb-2'/>
        <span className="text-sm text-slate-700">
          <span className="font-bold mr-1 text-slate-800">{like?.name}</span> liked your tweet
        </span>
        <span className="text-sm text-slate-500 inline-block">
          {like?.tweet}
        </span>
      </div>
  </div>
  )
}

const FollowsNotification = ({ follow }) => {
  const initial = follow?.name.split(' ').map((n) => n[0]).join('')
  const fallback = `https://via.placeholder.com/80/OEA5E9/FFFFFF?text=${initial.toUpperCase()}`
  const userIcon =  follow.photoUrl || fallback;
  return (
    <div className="flex flex-row py-2">
      <UserPlusIcon className='w-10 h-10 mr-2 text-sky-400' />
      <div className="flex flex-col">
        <img src={userIcon} className='w-10 h-10 rounded-full mb-2'/>
        <span className="text-sm text-slate-400">
          <span className="font-bold mr-1 text-slate-800">{follow?.name}</span> followed you.
        </span>
      </div>
  </div>
  )
}

const useNotifications = () =>{
  const [notifications, setNotifications] = useState([]);
  const user = getFirebaseInstance('auth')?.currentUser;
  const firestore = getFirebaseInstance('firestore');
  const ref = doc(firestore, 'notifications', user?.uid || 'me');
  const { status: notificationsDataStatus, data: notificationsData, error } = useFirestoreDocData(ref, {
    idField: 'id',
  });
  useEffect(() => {
    if (notificationsDataStatus === 'success' && notificationsData) {
      notificationsData.likes = notificationsData?.likes?.map(like => ({
        ...like,
        action: <LikeNotification like={like} />,
        reference: like.tweet
      }))
      notificationsData.follows = notificationsData?.follows?.map(follow => ({
        ...follow,
        action: <FollowsNotification follow={follow} />,
      }))
      setNotifications(notificationsData);
    }
  }, [notificationsDataStatus, notificationsData]);
  return [notificationsDataStatus, notifications, error];
}

export default useNotifications;