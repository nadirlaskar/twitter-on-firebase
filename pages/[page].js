import { useRouter } from "next/router";
import { useEffect } from "react";

export default () => {
  const router = useRouter();
  const { page } = router.query;
  useEffect(() => {
    if (page && !['search'].includes(page)) {
      router.push(`profile/${page}`);
    }
  },[page]);
  return null;
}