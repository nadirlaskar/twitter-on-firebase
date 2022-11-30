import Layout from "../components/Layout";
import RightSidebar from "../components/RightSidebar";
import useComponentWithFirebase from "../hooks/useComponentWithFirebase";

const Search =  () => { 
  return (
    <Layout leftBarChildren={<></>}>
      <RightSidebar />
    </Layout>
  )
}

export default (props) => {
  const WithAuth = (innerProps) => useComponentWithFirebase('auth', Search, innerProps);
  return useComponentWithFirebase('firestore', WithAuth, props);
};