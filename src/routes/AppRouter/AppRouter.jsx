import { Route, Routes } from 'react-router-dom'
import StoreLayout from '../../components/layout/StoreLayout/StoreLayout'
import Cart from '../../pages/Cart/Cart'
import ForgotPassword from '../../pages/Auth/ForgotPassword'
import Login from '../../pages/Auth/Login'
import Register from '../../pages/Auth/Register'
import VerifyOTP from '../../pages/Auth/VerifyOTP'
import Checkout from '../../pages/Checkout/Checkout'
import Payment from '../../pages/Checkout/Payment'
import Home from '../../pages/Home/Home'
import NotFound from '../../pages/NotFound/NotFound'
import OrderDetails from '../../pages/Orders/OrderDetails'
import OrderSuccess from '../../pages/Orders/OrderSuccess'
import MyOrders from '../../pages/Orders/MyOrders'
import ProductDetails from '../../pages/ProductDetails/ProductDetails'
import Products from '../../pages/Products/Products'
import Profile from '../../pages/Profile/Profile'
import Wishlist from '../../pages/Wishlist/Wishlist'
import GuestRoute from '../GuestRoute/GuestRoute'
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />

        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-otp" element={<VerifyOTP />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment" element={<Payment />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
