import { useRouter } from "next/router";
import { useEffect } from "react";

export default () => {
  const router = useRouter();
  const { page } = router.query;
  useEffect(() => {
    router.push(`profile/${page}`);
  });
  return null;
}