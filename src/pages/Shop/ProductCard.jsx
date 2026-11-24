import { motion } from "framer-motion";
import { Check, Heart, Loader2, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAddItemToCartMutation } from "../../redux/features/carts/cartApiSlice";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../../redux/features/wishlists/wishlistApiSlice";

const RATING_STARS = [1, 2, 3, 4, 5];

export default function ProductCard({
  product,
  isWishlisted = false,
  onToast,
}) {
  const [addedFeedback, setAddedFeedback] = useState(false);

  const notify = (message, type = "error") => {
    if (onToast) {
      onToast(message, type);
      return;
    }

    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const [addItemToCart, { isLoading: isAddingCart }] =
    useAddItemToCartMutation();
  const [addToWishlist, { isLoading: isAddingWish }] =
    useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWish }] =
    useRemoveFromWishlistMutation();

  const id = product?._id ?? product?.id;
  const firstImg = product?.images?.[0];
  const image =
    (typeof firstImg === "string" ? firstImg : firstImg?.url) ||
    product?.image ||
    "https://placehold.co/400x400/1e293b/f97316?text=Veroya";

  const categoryName =
    typeof product?.category === "object"
      ? (product?.category?.name ?? product?.category?.title ?? "")
      : (product?.category ?? "");

  const price = Number(product?.price ?? 0);
  const discountPrice = Number(product?.discountPrice ?? 0);
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice : price;
  const discountPercent = hasDiscount
    ? Math.max(1, Math.round(((price - discountPrice) / price) * 100))
    : 0;

  const rating = Number(product?.averageRating ?? product?.rating ?? 0);
  const numReviews = Number(product?.numReviews ?? product?.reviewsCount ?? 0);
  const outOfStock = product?.stock !== undefined && Number(product.stock) <= 0;
  const wishLoading = isAddingWish || isRemovingWish;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishLoading || !id) return;

    try {
      if (isWishlisted) {
        const res = await removeFromWishlist(id).unwrap();
        notify("Removed from wishlist", "success");
      } else {
        const res = await addToWishlist(id).unwrap();
        notify("Added to wishlist", "success");
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      if (err?.status === 401) {
        notify("Please login to add items to wishlist", "error");
      } else {
        notify(err?.data?.message ?? "Could not update wishlist", "error");
      }
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingCart || outOfStock || !id) return;

    try {
      const res = await addItemToCart({ productId: id, quantity: 1 }).unwrap();
      console.log("Added to cart:", {
        productId: id,
        quantity: 1,
        response: res,
      });
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 1600);
      notify("Added to cart successfully", "success");
    } catch (err) {
      console.error("Add to cart error:", err);
      if (err?.status === 401) {
        notify("Please login to add items to cart", "error");
      } else {
        notify(err?.data?.message ?? "Could not add to cart", "error");
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/50 p-3.5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 dark:border-white/10 dark:bg-black/45 dark:hover:border-orange-500/40"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-slate-100/80 dark:bg-white/5">
        <Link to={`/products/${id}`} className="block h-full w-full">
          <img
            src={image}
            alt={product?.name || "Product"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {categoryName && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full border border-slate-200/70 bg-white/90 px-2.5 py-0.5 text-[11px] font-bold capitalize text-orange-500 shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-black/65  ">
            {categoryName}
          </span>
        )}

        {hasDiscount && (
          <span className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md shadow-orange-500/30">
            -{discountPercent}%
          </span>
        )}

        {outOfStock && (
          <span className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-full border border-red-200 bg-white/95 px-3 py-1 text-center text-xs font-extrabold text-red-600 shadow-md">
            Out of Stock
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={wishLoading}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-all duration-200 ${
            isWishlisted
              ? "border-red-500/40 bg-red-500/15 text-red-500"
              : "border-slate-200/80 bg-white/90 text-red-500 hover:border-orange-500/50 hover:text-orange-500 dark:border-white/15 dark:bg-black/65 dark:text-slate-200 dark:hover:text-orange-400"
          }`}
        >
          {wishLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Heart
              size={16}
              className={isWishlisted ? "fill-red-500 text-red-500" : ""}
            />
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            to={`/products/${id}`}
            className="line-clamp-2 text-sm font-bold text-slate-900 transition-colors hover:text-orange-500 dark:text-white dark:hover:text-orange-400"
          >
            {product?.name}
          </Link>

          {/* Rating */}
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex items-center text-amber-400">
              {RATING_STARS.map((starValue) => (
                <Star
                  key={starValue}
                  size={13}
                  className={
                    starValue <= Math.round(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 dark:text-slate-600"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-orange-500 ">({numReviews})</span>
          </div>
        </div>

        <div className="mt-3 pt-2">
          <Link to={`/products/${id}`}>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-base font-extrabold text-orange-600 dark:text-orange-400">
                EGP {finalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-500 line-through">
                  EGP {price.toLocaleString()}
                </span>
              )}
            </div>
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAddingCart || outOfStock}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
              outOfStock
                ? "cursor-not-allowed border border-slate-200 bg-white/80 text-red-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                : addedFeedback
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
            }`}
          >
            {isAddingCart ? (
              <Loader2 size={15} className="animate-spin" />
            ) : outOfStock ? (
              "Out of Stock"
            ) : addedFeedback ? (
              <>
                <Check size={15} />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
