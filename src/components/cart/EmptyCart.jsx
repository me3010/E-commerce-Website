import { Link } from "react-router-dom";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/40 px-6 py-16 text-center shadow-sm backdrop-blur-md sm:py-20 dark:border-white/10 dark:bg-white/5">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-500/40 text-5xl">
        🛒
      </div>

      <h2 className="text-2xl font-bold text-orange-500">Your cart is empty</h2>

      <p className="mt-3 max-w-sm text-sm leading-6 text-slate-100 ">
        Looks like you haven't added anything to your cart yet. Explore our
        products and find something you love.
      </p>

      <Link
        to="/shop"
        className="mt-7 inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
