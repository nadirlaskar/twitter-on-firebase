import RightSidebar from "./RightSidebar";
import Sidebar from "./Sidebar";

const Layout = ({ children, page, leftBarChildren }) => {
  return (
    <div className="container mx-auto flex min-h-screen overflow-hidden">
      <div className=" flex-none w-2/12 border-r pr-6">
        <h1 className='text-2xl mt-4 text-sky-500 font-extrabold'>Next Twitter</h1>
        <Sidebar page={page} />
      </div>
      <div className="w-6/12 overflow-y-scroll no-scrollbar overflow-x-hidden">
        {children}
      </div>
      <div className="w-4/12 border-l overflow-hidden">
        {leftBarChildren || <RightSidebar/>}
      </div>
    </div>
  )
 }

export default Layout;