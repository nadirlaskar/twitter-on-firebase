import Layout from "../components/Layout"
import RightSidebar from "../components/RightSidebar"

export default () => { 
  return (
    <Layout leftBarChildren={<></>}>
      <RightSidebar />
    </Layout>
  )
}