import { Link } from "react-router-dom";
import { getCartTotals } from "../../utils/cartHelpers";
import { formatPrice } from "../../utils/formatPrice";

const FREE_SHIPPING_FROM = 1000;

export default function CartSummary({ cart }) {
  const items = cart?.items || [];
  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const { subtotal, discount, afterDiscount, shipping, tax, total } =
    getCartTotals(cart);

  return (
    <aside className="h-fit rounded-2xl border border-orange-500  bg-white/70 p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-xl font-bold text-black">Order Summary</h2>

      <dl className="space-y-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-orange-500">Items ({totalItems})</dt>
          <dd className="font-medium text-black">{formatPrice(subtotal)}</dd>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-orange-500">Discount</dt>
            <dd className="font-semibold text-green-600">
              -{formatPrice(discount)}
            </dd>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <dt className="text-orange-500">Shipping</dt>
          <dd className="font-medium text-slate-800">
            {shipping === 0 ? (
              <span className="font-semibold text-green-600">Free</span>
            ) : (
              formatPrice(shipping)
            )}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-orange-500">Tax (14%)</dt>
          <dd className="font-medium text-slate-800">{formatPrice(tax)}</dd>
        </div>
      </dl>

      {afterDiscount > 0 && afterDiscount < FREE_SHIPPING_FROM && (
        <div className="mt-4 rounded-xl bg-orange-50 p-3">
          <p className="text-xs leading-5 text-orange-700">
            Add{" "}
            <span className="font-bold">
              {formatPrice(FREE_SHIPPING_FROM - afterDiscount)}
            </span>{" "}
            more for free shipping.
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
        <span className="text-base font-semibold text-slate-700">Total</span>
        <span className="text-xl font-bold text-orange-600">
          {formatPrice(total)}
        </span>
      </div>

      <Link
        to="/checkout"
        className="mt-6 block w-full rounded-xl bg-orange-500 py-3 text-center font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        Proceed to Checkout
      </Link>
      <Link
        to="/shop"
        className="mt-6 block w-full rounded-xl text-orange-500 py-3 text-center font-semibold  transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        Continue Shopping
      </Link>

      <p className="mt-3 text-center text-xs text-black">
        Secure checkout · Fast & easy payment
      </p>
    </aside>
  );
}
