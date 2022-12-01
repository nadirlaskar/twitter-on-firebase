import router from "next/router";
import useComponentWithFirebase from "../hooks/useComponentWithFirebase";
import useFollowSuggestions from "../hooks/useFollowSuggestions";
import { ShowUserInfo } from "./Authenticate";
import { FollowButton } from "./ProfileHeader";
import Loading from "./ui-blocks/loading";

const FollowSuggestions = () => {
  const [loadingSuggestions, suggestions = []] = useFollowSuggestions();
  if (loadingSuggestions) {
    return <Loading className={'w-5 h-5 text-sky-300 m-12'} />
  }
  return (
    <div className="p-2 mt-4">
      <h3 className="text-md font-semibold w-full ml-3 mb-3 text-slate-400">Suggestions for you</h3>
      {(
        suggestions && suggestions.length > 0 && (
          suggestions.map((suggestion) => (
            <>
              <div key={suggestion.handle} onClick={() => { 
                router.push(`/${suggestion.handle}`);
              }} className="flex p-2 border-b justify-between hover:bg-slate-100 hover:cursor-pointer">
                <ShowUserInfo
                  key={suggestion.handle}
                  profileHandle={suggestion.handle}
                  rootStyles={'inline-flex flex-row items-center'}
                  showImage={true}
                  showHandle={true}
                  showName={true}
                />
                <FollowButton profileHandle={suggestion?.handle} />
              </div>
            </>
          )))
      )}
    </div>
  )

}
export default (props) => {
  const WithAuth = (innerProps) => useComponentWithFirebase('auth', FollowSuggestions, innerProps);
  return useComponentWithFirebase('firestore', WithAuth, props);
};