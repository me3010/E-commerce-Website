import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  useRemoveItemFromCartMutation,
  useUpdateCartItemQuantityMutation,
} from "../../redux/features/carts/cartApiSlice";
import {
  getErrorMessage,
  getItemImage,
  getItemName,
  getItemPrice,
  getProductId,
} from "../../utils/cartHelpers";
import { formatPrice } from "../../utils/formatPrice";
import QuantitySelector from "./QuantitySelector";

export default function CartItem({ item }) {
  const [updateQuantity, { isLoading: updating }] =
    useUpdateCartItemQuantityMutation();
  const [removeItem, { isLoading: removing }] = useRemoveItemFromCartMutation();
  const [error, setError] = useState("");

  const productId = getProductId(item);
  const name = getItemName(item);
  const image = getItemImage(item);
  const price = getItemPrice(item);
  const busy = updating || removing;

  async function handleQuantity(quantity) {
    if (!productId || quantity < 1) return;
    setError("");
    try {
      await updateQuantity({ productId, quantity }).unwrap();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update quantity"));
    }
  }

  async function handleRemove() {
    if (!productId) return;
    setError("");
    try {
      await removeItem(productId).unwrap();
      toast.success("Item removed from cart");
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to remove item");
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <li
      className={`flex flex-col gap-4 rounded-2xl border border-orange-500 bg-white/70 p-4 transition-shadow hover:shadow-sm sm:flex-row sm:gap-5 sm:p-5 ${
        busy ? "opacity-60" : ""
      }`}
    >
      <div className="flex shrink-0 items-center border border-orange-500 justify-center overflow-hidden rounded-xl bg-slate-50 sm:h-32 sm:w-32">
        <img
          src={image}
          alt={name}
          className="h-28 w-full object-cover sm:h-32 sm:w-32"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-6 text-slate-800 sm:text-lg">
            {name}
          </h3>

          <p className="shrink-0 font-bold text-orange-600">
            {formatPrice(price * item.quantity)}
          </p>
        </div>

        <p className="text-sm text-slate-500">
          {formatPrice(price)} <span>per item</span>
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={busy ? "pointer-events-none" : ""}>
            <QuantitySelector
              quantity={item.quantity}
              onChange={handleQuantity}
            />
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            aria-label="Remove item"
            title="Remove"
            className="grid h-9 w-9 place-items-center rounded-lg text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </li>
  );
}
