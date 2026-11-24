import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import environment from "../../../config/environment";

const dynamicBaseUrl = "/api";

const baseQuery = fetchBaseQuery({
  baseUrl: dynamicBaseUrl,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = Cookies.get("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args?.url;
  const isAuthForm = /^\/?auth\/(login|register|forgot-password)/.test(
    url ?? "",
  );
  const isSessionCheck = /^\/?auth\/(me|profile)/.test(url ?? "");

  if (result.error?.status === 401 && !isAuthForm) {
    if (isSessionCheck) {
      Cookies.remove("token", { path: "/" });
      try {
        localStorage.removeItem("isAuthenticated");
      } catch {}
      window.dispatchEvent(new Event("authChange"));
      api.dispatch(apiSlice.util.resetApiState());

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Cart", "Wishlist", "Product", "Review", "Order", "User"],
  endpoints: () => ({}),
});
