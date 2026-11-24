import { TicketPercent, Trash } from "lucide-react";
import { useState } from "react";
import {
  useApplyCouponMutation,
  useRemoveCouponMutation,
} from "../../redux/features/carts/cartApiSlice";
import { getErrorMessage } from "../../utils/cartHelpers";

export default function CouponInput({ coupon }) {
  const [applyCoupon, { isLoading: applying }] = useApplyCouponMutation();
  const [removeCoupon, { isLoading: removing }] = useRemoveCouponMutation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setError("");
    try {
      await applyCoupon({ code: trimmed }).unwrap();
      setCode("");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid coupon"));
    }
  }

  async function handleRemove() {
    setError("");
    try {
      await removeCoupon().unwrap();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to remove coupon"));
    }
  }

  if (coupon) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-800">
          <span>
            Coupon <strong>{coupon.code}</strong> applied successfully
          </span>

          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className=" text-red-500 disabled:opacity-50"
          >
            <Trash />
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <label
        htmlFor="coupon-code"
        className="mb-2 block text-sm font-medium text-white"
      >
        <TicketPercent
          size={18}
          className="text-orange-500 me-2 inline-block"
        />
        <span>Coupon Code</span>
      </label>

      <div className="flex gap-2">
        <input
          id="coupon-code"
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          placeholder="Enter coupon code"
          className="min-w-0 flex-1 rounded-xl border border-orange-500  bg-white/70 px-3 py-2.5 text-sm font-medium text-slate-900 caret-orange-500 outline-none transition-all placeholder:font-normal placeholder:text-orange-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />

        <button
          type="submit"
          disabled={applying}
          className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          {applying ? "Applying..." : "Apply"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </form>
  );
}
