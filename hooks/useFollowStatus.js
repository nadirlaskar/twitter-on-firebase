import { useCallback, useEffect, useState } from "react";
import { followUserFirebase, unfollowUserFirebase } from "../libs/firebase.util";
import useProfile from "./useProfile";

const useFollowStatusFromFirestore = (handle) => {
  const [ profileStatus, profileData ] = useProfile(handle);
  const [ userStatus, userData ] = useProfile('me');
  const [followStatus, setFollowStatus] = useState(null);
  const [ updatigFollowStatus, setUpdatingFollowStatus ] = useState(false);
  const followUser = useCallback(async () => {
    if (userData && profileData) {
      setUpdatingFollowStatus(true);
      const [status] = await followUserFirebase(handle);
      if (status === 'success') {
        setFollowStatus(true);
      }
      setUpdatingFollowStatus(false);
    }
  }, [userData, profileData]);
  const unfollowUser = useCallback(async () => {
    if (userData && profileData) {
      setUpdatingFollowStatus(true);
      const [status] = await unfollowUserFirebase(handle);
      if (status === 'success') {
        setFollowStatus(false);
      }
      setUpdatingFollowStatus(false);
    }
  }, [userData, profileData]);
  
  useEffect(() => {
    if (profileStatus === 'success' && profileData && userStatus === 'success' && userData) {
      console.log('profileData', profileData);
      const isFollowing = profileData.followers?.includes(userData.id) ?? false;
      setFollowStatus(isFollowing);
    }
  }, [profileStatus, profileData, userStatus, userData]);
  return {
    status: (profileStatus === 'success' && userStatus === 'success' && !updatigFollowStatus) ? 'success' : 'loading',
    isFollowing: followStatus,
    follow: followUser,
    unfollow: unfollowUser,
  };
}
export default useFollowStatusFromFirestore;