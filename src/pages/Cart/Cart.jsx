import { useState } from "react";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import CouponInput from "../../components/cart/CouponInput";
import EmptyCart from "../../components/cart/EmptyCart";
import PageLoader from "../../components/common/Loader/PageLoader";
import {
  useClearCartMutation,
  useGetMyCartQuery,
} from "../../redux/features/carts/cartApiSlice";
import {
  getCart,
  getErrorMessage,
  getProductId,
} from "../../utils/cartHelpers";

export default function Cart() {
  const { data, isLoading, isError, error, refetch } = useGetMyCartQuery();
  const [clearCart, { isLoading: clearing }] = useClearCartMutation();
  const [clearError, setClearError] = useState("");

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-slate-800">
            Couldn't load your cart
          </p>
          <p className="mt-2 text-sm text-red-500">
            {getErrorMessage(error, "Please try again")}
          </p>
          <button
            type="button"
            onClick={refetch}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const cart = getCart(data);
  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyCart />
      </main>
    );
  }

  async function handleClear() {
    setClearError("");
    try {
      await clearCart().unwrap();
    } catch (err) {
      setClearError(getErrorMessage(err, "Failed to clear cart"));
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl  px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Shopping Cart
          </h1>

          <p className="mt-2 text-sm text-orange-500">
            Review your items before proceeding to checkout.
          </p>
        </div>

        <div className="flex flex-col items-start gap-1 sm:items-end">
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="w-fit rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors bg-orange-50   disabled:opacity-50"
          >
            {clearing ? "Clearing..." : "Clear cart"}
          </button>
          {clearError && <p className="text-xs text-red-500">{clearError}</p>}
        </div>
      </div>

      {/* Cart Content */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-8">
        <section className="min-w-0">
          <ul className="space-y-4">
            {items.map((item, index) => (
              <CartItem key={getProductId(item) || index} item={item} />
            ))}
          </ul>
          <CouponInput coupon={cart?.coupon} />
        </section>

        <aside className="w-full lg:sticky lg:top-6">
          <CartSummary cart={cart} />
        </aside>
      </div>
    </main>
  );
}
