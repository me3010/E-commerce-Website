import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  useGetMyWishlistQuery,
  useRemoveFromWishlistMutation,
} from "../../redux/features/wishlists/wishlistApiSlice";

import { useAddItemToCartMutation } from "../../redux/features/carts/cartApiSlice";

import EmptyWishlist from "./EmptyWishlist";
import WishlistProducts from "./WishlistProducts";

const WISHLIST_SKELETON_KEYS = [
  "wishlist-skeleton-1",
  "wishlist-skeleton-2",
  "wishlist-skeleton-3",
  "wishlist-skeleton-4",
];

const getItems = (response) => {
  const value =
    response?.wishlist?.products ??
    response?.data?.wishlist?.products ??
    response?.data?.products ??
    response?.products ??
    response?.data?.items ??
    response?.items ??
    [];

  return Array.isArray(value) ? value : [];
};

const getProduct = (item) => item?.product ?? item?.productDetails ?? item;

const getId = (item) => {
  const product = getProduct(item);

  return (
    product?._id ?? product?.id ?? item?.productId ?? item?._id ?? item?.id
  );
};

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {WISHLIST_SKELETON_KEYS.map((skeletonKey) => (
        <div
          key={skeletonKey}
          className="overflow-hidden rounded-3xl border border-orange-200/80 bg-white/60 p-3 shadow-sm backdrop-blur-xl dark:border-orange-500/20 dark:bg-white/5"
        >
          <div className="aspect-4/3 animate-pulse rounded-2xl bg-orange-100/70 dark:bg-slate-800" />

          <div className="space-y-3 px-2 pb-2 pt-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-orange-100/70 dark:bg-slate-800" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-orange-100/70 dark:bg-slate-800" />
            <div className="h-10 animate-pulse rounded-xl bg-orange-100/70 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Wishlist() {
  const { data, error, isLoading, isError } = useGetMyWishlistQuery();

  const [removeFromWishlist, { isLoading: isRemoving }] =
    useRemoveFromWishlistMutation();

  const [addItemToCart, { isLoading: isAdding }] = useAddItemToCartMutation();

  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState("");

  const items = useMemo(() => getItems(data), [data]);
  console.log("Wishlist API Response:", data);
  console.log("Wishlist Items:", items);
  console.log("Loading:", isLoading);
  console.log("Error:", isError);

  const handleRemove = async (id) => {
    if (!id) return;

    setBusyId(id);

    try {
      await removeFromWishlist(id).unwrap();
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Could not remove this product");
    } finally {
      setBusyId(null);
    }
  };

  const handleAddToCart = async (itemOrId) => {
    const isObject = typeof itemOrId === "object" && itemOrId !== null;
    const id = isObject ? getId(itemOrId) : itemOrId;
    const product = isObject ? getProduct(itemOrId) : null;

    if (!id) return;

    if (product?.stock !== undefined && Number(product.stock) <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }

    setBusyId(id);

    try {
      await addItemToCart({
        productId: id,
        quantity: 1,
      }).unwrap();
      toast.success("Product added to cart");
    } catch (err) {
      const msg =
        err?.data?.message || "Could not add this product to your cart";
      toast.error(
        /stock|out of stock/i.test(msg)
          ? "This product is currently out of stock"
          : msg,
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl pb-10">
      {!isLoading && !isError && items.length > 0 && (
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight  text-white sm:text-4xl">
            My Wishlist
          </h1>
        </div>
      )}

      {isLoading ? (
        <WishlistSkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
          We could not load your wishlist. Please refresh the page and try
          again.
        </div>
      ) : items.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <WishlistProducts
          items={items}
          busyId={busyId}
          isRemoving={isRemoving}
          isAdding={isAdding}
          handleRemove={handleRemove}
          handleAddToCart={handleAddToCart}
        />
      )}
    </section>
  );
}
