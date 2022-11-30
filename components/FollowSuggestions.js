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
    <div className="p-2 mt-4">{(
      suggestions && suggestions.length > 0 && (
        suggestions.map((suggestion) => (
          <>
            <div className="flex p-2 border-b justify-between">
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
export default FollowSuggestions;