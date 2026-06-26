import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentToken } from "@/redux/slices/authSlice";
import useAxiosSecure from "./useAxiosSecure";
import { useEffect } from "react";
import { setUser } from "@/redux/slices/uiSlice";

export const selectUser = (state) => state.ui.user;

export const useUserProfile = () => {
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();
  const axiosSecure = useAxiosSecure();

  const query = useQuery({
    queryKey: ["userProfile", token],
    queryFn: async () => {
      if (!token) return null;
      const res = await axiosSecure.get("/auth/profile");
      return res.data?.data || null;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setUser(query.data));
    }
  }, [query.data, dispatch]);

  return query;
};
