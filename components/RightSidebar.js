import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { push } from "next/router";
import { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { searchUserByHandleFromFirebase } from "../libs/firebase.util";
import FollowSuggestions from "./FollowSuggestions";
import AutoComplete from "./ui-blocks/autoComplete";

const SearchInput = () => {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const debouncedSearch = useDebounce(search, 500);
  useEffect(() => {
    if (debouncedSearch) {
      searchUserByHandleFromFirebase(debouncedSearch).then(setSearchResults);
    }
  }, [debouncedSearch])
  return (
    <div className='relative flex items-center justify-center rounded-full bg-slate-200 border-2 text-slate-400 pl-4 w-full max-w-xs hover:border-sky-600 hover:border-2 hover:text-sky-600 hover:bg-slate-50 lg:max-w-lg'>
      <MagnifyingGlassIcon className="w-6 h-6 mr-1  hover:text-sky-600"/>
      <AutoComplete
        setSelected={(selected) => { 
          push(`/${selected?.handle}`);
        }}
        options={searchResults}
        rootStyles={'!static w-full z-40'}
        renderValue={(option) => option?`${option?.name}`:''}
        renderOption={(option) => {
          const fallback = `https://via.placeholder.com/80/OEA5E9/FFFFFF?text=${option?.name[0]?.toUpperCase()}`;
          const image = option.photoURL || fallback
          return (
            <div className='flex flex-row items-center justify-between w-full'>
              <div className='flex flex-row items-center justify-start'>
                <img width={40} height={40}
                  className={
                    classNames(
                      'rounded-full', 'inline-block',
                      { "mr-2 my-4": true }
                    )
                  }
                  src={image}
                  onError={(e) => {
                    e.target.error = null;
                    e.target.src = fallback;
                  }}
                />
                <div className='inline-block'>
                  <div className='leading-3'>{option.name}</div>
                  <div className='text-sm text-slate-500'>@{option.handle}</div>
                </div>
              </div>
            </div>
          )
        }}
                
        setQuery={(q) => {
          setSearch(q);
        }}
        inputProps={{
          placeholder: 'Search user by handle or name',
          className: 'bg-transparent flex-grow h-10 border-none  rounded-full outline-none focus:outline-none w-full text-sm',
          type: 'text'
        }}
      />
    </div>
  )
}
const RightSidebar = () => {
  return (
    <div className='flex flex-col w-full h-full relative px-2 mt-2'>
      <SearchInput />
      <FollowSuggestions />
    </div>
  )
}
export default RightSidebar;