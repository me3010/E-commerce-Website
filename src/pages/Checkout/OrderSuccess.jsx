import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Link, Navigate, useLocation } from "react-router-dom";

export default function OrderSuccess() {
  const location = useLocation();

  const order = location.state?.order;

  const orderData = order?.order ?? order;

  const orderId = orderData?._id;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <main className="relative isolate mx-2 my-4 min-h-[75vh] overflow-hidden rounded-[26px]   px-3 py-12 text-slate-800 shadow-xl transition-colors duration-500   dark:text-slate-100 sm:mx-4 sm:my-6 sm:rounded-[36px] sm:px-6 sm:py-16 lg:mx-5 lg:my-8 lg:rounded-[44px] lg:px-10 lg:py-20">
      <div
        className="absolute inset-0 -z-10 bg-white/50 backdrop-blur-md transition-colors duration-500 dark:bg-white/10  "
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-3xl">
        <div className="mx-auto mb-10 flex max-w-md items-center justify-center gap-3 sm:mb-14">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white sm:h-10 sm:w-10">
              <CheckCircle2 size={19} />
            </span>

            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:text-sm">
              Cart
            </span>
          </div>

          <div className="h-1 flex-1 rounded-full bg-emerald-500" />

          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white sm:h-10 sm:w-10">
              <CheckCircle2 size={19} />
            </span>

            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:text-sm">
              Checkout
            </span>
          </div>

          <div className="h-1 flex-1 rounded-full bg-emerald-500" />

          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-white sm:h-10 sm:w-10">
              <CheckCircle2 size={19} />
            </span>

            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 sm:text-sm">
              Complete
            </span>
          </div>
        </div>

        <section className="text-center">
          <div className="mx-auto mb-7 grid h-24 w-24 place-items-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5 sm:h-28 sm:w-28">
            <CheckCircle2
              size={58}
              strokeWidth={1.7}
              className="text-emerald-500"
            />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 backdrop-blur-sm dark:text-emerald-400 sm:text-xs">
            <ClipboardCheck size={15} />
            Order Confirmed
          </span>

          <h1 className="mt-6 text-2xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
            Order Placed Successfully!
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            Thank you for shopping with us! Your order has been received
            successfully. We are getting it ready for you.
          </p>

          {orderId && (
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/30 bg-white/10 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Your Order Number
              </p>

              <p className="mt-2 break-all text-lg font-extrabold text-orange-600 dark:text-orange-400 sm:text-xl">
                #{orderId}
              </p>
            </div>
          )}

          <div className="mx-auto mt-7 flex max-w-lg items-center gap-4 rounded-2xl border border-slate-200/50 bg-white/25 p-4 text-left shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/20 sm:p-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
              <Truck size={25} />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cash on Delivery
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                You will pay when your order arrives at your doorstep.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-9 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to={orderId ? `/orders/${orderId}` : "/orders"}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-orange-400 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30"
            >
              <Package size={18} />
              Track My Order
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/shop"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white/30 px-6 py-3.5 text-sm font-bold text-slate-800 backdrop-blur-sm transition-all duration-300 hover:border-orange-400 hover:text-orange-600 dark:border-white/20 dark:bg-slate-900/20 dark:text-white dark:hover:border-orange-400 dark:hover:text-orange-400"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>
          </div>

          <p className="mt-8 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Thank you for choosing our store. We appreciate your trust!
          </p>
        </section>
      </div>
    </main>
  );
}
