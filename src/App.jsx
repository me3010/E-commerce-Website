import Cookies from "js-cookie";
import { Suspense, lazy, useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  useLocation,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PageLoader from "./components/common/Loader/PageLoader";
import StoreLayout from "./components/layout/StoreLayout/StoreLayout";
import ErrorPage from "./pages/error/ErrorPage";

const Home = lazy(() => import("./pages/Home/Home"));
const Shop = lazy(() => import("./pages/Shop/shop"));
const ProductDetails = lazy(() => import("./pages/Shop/ProductDetails"));

const Login = lazy(() => import("./pages/Auth/Login"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));

const Cart = lazy(() => import("./pages/Cart/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist/Wishlist"));
const Checkout = lazy(() => import("./pages/Checkout/Checkout"));
const OrderSuccess = lazy(() => import("./pages/Checkout/OrderSuccess"));
const MyOrders = lazy(() => import("./pages/Orders/MyOrders"));
const OrderDetails = lazy(() => import("./pages/Orders/OrderDetails"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const hasSession = () => {
  if (Cookies.get("token")) return true;
  try {
    return localStorage.getItem("isAuthenticated") === "true";
  } catch {
    return false;
  }
};

const ProtectedRoute = () => {
  const location = useLocation();
  const [isAuthed, setIsAuthed] = useState(() => hasSession());

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthed(hasSession());
    };

    syncAuth();
    window.addEventListener("authChange", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("authChange", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const allowed = isAuthed || hasSession();

  useEffect(() => {
    if (!allowed) {
      toast.warning("Please log in first to access this page.", {
        toastId: "auth-required",
      });
    }
  }, [allowed]);

  if (!allowed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const RootRedirect = () => {
  const allowed = hasSession();
  return <Navigate to={allowed ? "/home" : "/login"} replace />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" errorElement={<ErrorPage />}>
      <Route index element={<RootRedirect />} />

      <Route element={<StoreLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="products/:id" element={<ProductDetails />} />

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:id" element={<OrderSuccess />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>,
  ),
);

export default function App() {
  const [themeType, setThemeType] = useState(() => Cookies.get("veroya-theme"));

  useEffect(() => {
    const syncTheme = () => setThemeType(Cookies.get("veroya-theme"));
    window.addEventListener("themeChange", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("themeChange", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <RouterProvider router={router} />
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={themeType === "dark" ? "dark" : "light"}
      />
    </>
  );
}
