import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  ArrowRight,
  Eye,
  Heart,
  Package,
  ShoppingCart,
  Star,
} from "lucide-react";

import { useMeQuery } from "../../redux/features/auth/authApiSlice";

import {
  useAddItemToCartMutation,
  useGetMyCartQuery,
  useUpdateCartItemQuantityMutation,
} from "../../redux/features/carts/cartApiSlice";

import {
  useAddToWishlistMutation,
  useGetMyWishlistQuery,
  useRemoveFromWishlistMutation,
} from "../../redux/features/wishlists/wishlistApiSlice";

const SKELETON_STARS = ["star-1", "star-2", "star-3", "star-4", "star-5"];
const SKELETON_CARDS = Array.from(
  { length: 8 },
  (_, index) => `skeleton-${index + 1}`,
);
const RATING_STARS = [1, 2, 3, 4, 5];

const showAlert = (icon, title) => {
  const isDark = document.documentElement.classList.contains("dark");

  return Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    background: isDark ? "#1c1916" : "#ffffff",
    color: isDark ? "#ffffff" : "#1e293b",
    customClass: {
      popup: "rounded-xl",
    },
  });
};

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#30251e] dark:bg-linear-to-b dark:from-[#1c1916] dark:to-[#11100e]">
    <div className="animate-pulse">
      <div className="relative h-56 bg-slate-200 dark:bg-[#292019]">
        <div className="absolute left-3 top-3 h-7 w-16 rounded-lg bg-slate-300 dark:bg-[#3a2e25]" />
        <div className="absolute right-3 top-3 h-10 w-10 rounded-full bg-slate-300 dark:bg-[#3a2e25]" />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="h-3 w-24 rounded bg-slate-200 dark:bg-[#292019]" />
          <div className="h-3 w-20 rounded bg-slate-200 dark:bg-[#292019]" />
        </div>

        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-[#292019]" />

        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-slate-200 dark:bg-[#292019]" />
          <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-[#292019]" />
        </div>

        <div className="flex items-center gap-1">
          {SKELETON_STARS.map((starKey) => (
            <div
              key={starKey}
              className="h-4 w-4 rounded bg-slate-200 dark:bg-[#292019]"
            />
          ))}
          <div className="ml-2 h-3 w-10 rounded bg-slate-200 dark:bg-[#292019]" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-6 w-24 rounded bg-slate-200 dark:bg-[#292019]" />
          <div className="h-4 w-16 rounded bg-slate-200 dark:bg-[#292019]" />
        </div>

        <div className="h-12 rounded-xl bg-slate-200 dark:bg-[#292019]" />
      </div>
    </div>
  </div>
);

const getProductId = (product) => product?._id || product?.id;

const getImage = (product) => {
  const image = product?.images?.[0];

  if (typeof image === "string") {
    return image;
  }

  return (
    image?.url ||
    image?.secure_url ||
    image?.imageUrl ||
    product?.image ||
    "/placeholder-product.png"
  );
};

const getDiscount = (product) => {
  const price = Number(product?.price);
  const discountPrice = Number(product?.discountPrice);

  if (!price || !discountPrice || discountPrice >= price || price <= 0) {
    return 0;
  }

  return Math.round(((price - discountPrice) / price) * 100);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);
};

const normalizeCartItems = (cartData) => {
  const candidates = [
    cartData?.data?.cart?.items,
    cartData?.data?.cart?.products,
    cartData?.data?.items,
    cartData?.data?.products,
    cartData?.cart?.items,
    cartData?.cart?.products,
    cartData?.items,
    cartData?.products,
    cartData?.data,
    cartData,
  ];

  return candidates.find(Array.isArray) || [];
};

const normalizeWishlistItems = (wishlistData) => {
  const candidates = [
    wishlistData?.data?.wishlist?.items,
    wishlistData?.data?.wishlist?.products,
    wishlistData?.wishlist?.items,
    wishlistData?.wishlist?.products,
    wishlistData?.data?.items,
    wishlistData?.data?.products,
    wishlistData?.items,
    wishlistData?.products,
    wishlistData?.data,
  ];

  return candidates.find(Array.isArray) || [];
};

export default function Cards({
  products = [],
  isLoading = false,
  isError = false,
}) {
  const navigate = useNavigate();

  const [processingProductId, setProcessingProductId] = useState(null);
  const [updatingWishlistId, setUpdatingWishlistId] = useState(null);

  const {
    isLoading: authLoading,
    isError: authError,
    isSuccess: authSuccess,
  } = useMeQuery();

  const isAuthenticated = authSuccess && !authError;

  const { data: cartData, isLoading: cartLoading } = useGetMyCartQuery(
    undefined,
    {
      skip: authLoading || !isAuthenticated,
    },
  );

  const [addItemToCart, { isLoading: addingToCart }] =
    useAddItemToCartMutation();

  const [updateCartItemQuantity] = useUpdateCartItemQuantityMutation();

  const cartItems = useMemo(() => normalizeCartItems(cartData), [cartData]);

  const getCartItem = (productId) => {
    if (!productId) return null;

    return (
      cartItems.find((item) => {
        const product =
          typeof item?.product === "object"
            ? item.product?._id || item.product?.id
            : item?.product;

        const productIdValue =
          typeof item?.productId === "object"
            ? item.productId?._id || item.productId?.id
            : item?.productId;

        const id = product || productIdValue;

        return String(id) === String(productId);
      }) || null
    );
  };

  const { data: wishlistData, isLoading: wishlistLoading } =
    useGetMyWishlistQuery(undefined, {
      skip: authLoading || !isAuthenticated,
    });

  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const wishlistItems = useMemo(
    () => normalizeWishlistItems(wishlistData),
    [wishlistData],
  );

  const isWishlisted = (productId) => {
    if (!productId) return false;

    return wishlistItems.some((item) => {
      const id =
        item?.product?._id ||
        item?.product?.id ||
        item?.productId?._id ||
        item?.productId?.id ||
        item?.productId ||
        item?._id ||
        item?.id;

      return String(id) === String(productId);
    });
  };

  const requireLogin = async (action = "continue") => {
    const isDark = document.documentElement.classList.contains("dark");

    const result = await Swal.fire({
      icon: "info",
      title: "Login Required",
      text: `Please login to ${action}.`,
      confirmButtonText: "Go to Login",
      confirmButtonColor: "#f97316",
      showCancelButton: true,
      cancelButtonText: "Continue Shopping",
      background: isDark ? "#1c1916" : "#ffffff",
      color: isDark ? "#ffffff" : "#1e293b",
    });

    if (result.isConfirmed) {
      navigate("/login", {
        state: {
          from: window.location.pathname,
        },
      });
    }
  };

  const handleProductDetails = (productId) => {
    if (!productId) return;

    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (product) => {
    if (authLoading) return;

    if (!isAuthenticated) {
      await requireLogin("add products to your cart");
      return;
    }

    const productId = getProductId(product);

    if (!productId) {
      showAlert("error", "Invalid product.");
      return;
    }

    if (processingProductId) return;

    const stock = Number(product?.stock ?? 0);

    if (stock <= 0) {
      showAlert("error", "This product is out of stock.");
      return;
    }

    const existingCartItem = getCartItem(productId);
    const currentQuantity = Number(existingCartItem?.quantity ?? 0);

    if (existingCartItem && currentQuantity >= stock) {
      showAlert("warning", "You have reached the maximum available quantity.");
      return;
    }

    try {
      setProcessingProductId(String(productId));

      if (existingCartItem) {
        const newQuantity = currentQuantity + 1;

        await updateCartItemQuantity({
          productId,
          quantity: newQuantity,
        }).unwrap();

        await showAlert("success", `Quantity increased to ${newQuantity}!`);
      } else {
        await addItemToCart({
          productId,
          quantity: 1,
        }).unwrap();

        await showAlert("success", "Product added to cart!");
      }
    } catch (error) {
      console.error("Add to cart error:", error);

      showAlert(
        "error",
        error?.data?.message || error?.message || "Failed to update cart.",
      );
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleWishlist = async (product) => {
    if (authLoading) return;

    if (!isAuthenticated) {
      await requireLogin("add products to your wishlist");
      return;
    }

    const productId = getProductId(product);

    if (!productId) {
      showAlert("error", "Invalid product.");
      return;
    }

    if (updatingWishlistId) return;

    try {
      setUpdatingWishlistId(String(productId));

      if (isWishlisted(productId)) {
        await removeFromWishlist(productId).unwrap();
        await showAlert("success", "Removed from wishlist.");
      } else {
        await addToWishlist(productId).unwrap();
        await showAlert("success", "Added to wishlist.");
      }
    } catch (error) {
      console.error("Wishlist error:", error);

      showAlert(
        "error",
        error?.data?.message || error?.message || "Failed to update wishlist.",
      );
    } finally {
      setUpdatingWishlistId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="bg-slate-50/90 px-4 py-16 text-slate-900 transition-colors duration-300 dark:bg-[#0b0a09] dark:text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div className="w-full animate-pulse">
              <div className="mb-3 h-7 w-32 rounded-full bg-orange-100 dark:bg-orange-500/10" />
              <div className="h-10 w-64 rounded-lg bg-slate-200 dark:bg-[#292019]" />
              <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200 dark:bg-[#292019]" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SKELETON_CARDS.map((cardKey) => (
              <SkeletonCard key={cardKey} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-16 text-slate-900 transition-colors duration-300 dark:text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              Our Collection
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Featured Products
            </h2>

            <p className="mt-3 max-w-xl text-sm text-orange-500 sm:text-base">
              Discover our handpicked products and find something you will love.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="group flex items-center gap-2 rounded-xl border border-orange-500/30 bg-white px-5 py-3 text-sm font-bold text-orange-600 transition hover:bg-orange-500 hover:text-white dark:text-orange-400"
          >
            View All Products
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-500/20 dark:bg-red-500/5">
            <Package size={42} className="mx-auto mb-4 text-red-500" />

            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
              Something went wrong
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-stone-400">
              We couldn't load the products. Please try again later.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-5 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Browse Shop
            </button>
          </div>
        )}

        {!isError && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => {
              const productId = getProductId(product);
              const discount = getDiscount(product);

              const wishlisted = isWishlisted(productId);
              const cartItem = getCartItem(productId);
              const inCart = Boolean(cartItem);

              const currentQuantity = Number(cartItem?.quantity ?? 0);

              const isProcessing = processingProductId === String(productId);

              const isUpdatingWishlist =
                updatingWishlistId === String(productId);

              const stock = Number(product?.stock ?? 0);
              const outOfStock = stock <= 0;

              const reachedStockLimit = inCart && currentQuantity >= stock;

              const image = getImage(product);

              const finalPrice =
                discount > 0 ? product.discountPrice : product.price;

              const rating = Math.max(
                0,
                Math.min(5, Number(product?.averageRating) || 0),
              );

              const cardKey = productId || `product-${index}`;

              return (
                <motion.div
                  key={cardKey}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{
                    once: true,
                    amount: 0.15,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: (index % 4) * 0.08,
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 dark:border-[#30251e] dark:bg-linear-to-b dark:from-[#1c1916] dark:to-[#11100e]"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-[#211b16]">
                    <button
                      type="button"
                      onClick={() => handleProductDetails(productId)}
                      className="h-full w-full"
                      aria-label={`View ${product.name || "product"}`}
                    >
                      <img
                        src={image}
                        alt={product.name || "Product"}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/placeholder-product.png";
                        }}
                        className={`h-full w-full object-cover transition duration-700 ${
                          outOfStock
                            ? "scale-100 opacity-50 grayscale"
                            : "group-hover:scale-110"
                        }`}
                      />
                    </button>

                    {outOfStock && (
                      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/25">
                        <span className="rounded-xl border-2 border-red-500 bg-red-600 px-7 py-3 text-sm font-extrabold uppercase tracking-widest text-white shadow-2xl shadow-red-900/40">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {discount > 0 && (
                      <span className="absolute left-3 top-3 z-20 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg">
                        -{discount}%
                      </span>
                    )}

                    {product.featured && (
                      <span className="absolute bottom-3 left-3 z-20 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-black">
                        Featured
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleWishlist(product)}
                      disabled={
                        authLoading || isUpdatingWishlist || wishlistLoading
                      }
                      aria-label={
                        wishlisted ? "Remove from wishlist" : "Add to wishlist"
                      }
                      className={`absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur-md transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        wishlisted
                          ? "bg-orange-500 text-white"
                          : "bg-white/90 text-slate-700 hover:bg-orange-500 hover:text-white dark:bg-black/50 dark:text-white"
                      }`}
                    >
                      {isUpdatingWishlist ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Heart
                          size={19}
                          fill={wishlisted ? "currentColor" : "none"}
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleProductDetails(productId)}
                      className="absolute bottom-3 right-3 z-20 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-white text-slate-800 opacity-0 shadow-lg transition duration-300 hover:bg-orange-500 hover:text-white group-hover:translate-y-0 group-hover:opacity-100 dark:bg-[#30251e] dark:text-white"
                      aria-label="View product details"
                    >
                      <Eye size={18} />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                        {product.category || "General"}
                      </span>

                      <span
                        className={`shrink-0 text-xs font-semibold ${
                          outOfStock
                            ? "text-red-500"
                            : stock <= 5
                              ? "text-amber-500"
                              : "text-emerald-500"
                        }`}
                      >
                        {outOfStock
                          ? "Out of Stock"
                          : stock <= 5
                            ? `Only ${stock} left`
                            : "In Stock"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleProductDetails(productId)}
                      className="mb-2 block w-full truncate text-left text-lg font-bold text-slate-900 transition hover:text-orange-500 dark:text-white"
                    >
                      {product.name || "Unnamed Product"}
                    </button>

                    <p className="mb-3 line-clamp-2 min-h-10 text-sm text-slate-500 dark:text-stone-400">
                      {product.shortDescription ||
                        product.description ||
                        "Discover this amazing product."}
                    </p>

                    <div className="mb-4 flex items-center gap-1">
                      {RATING_STARS.map((starValue) => {
                        const filled = starValue <= Math.round(rating);

                        return (
                          <Star
                            key={starValue}
                            size={15}
                            strokeWidth={1.8}
                            className={
                              filled
                                ? "fill-orange-400 text-orange-400"
                                : "fill-transparent text-slate-300 dark:text-stone-600"
                            }
                          />
                        );
                      })}

                      <span className="ml-1 text-xs font-medium text-slate-500 dark:text-stone-400">
                        ({rating.toFixed(1)})
                      </span>
                    </div>

                    <div className="mb-5 flex items-center gap-2">
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(finalPrice)}
                      </span>

                      {discount > 0 && (
                        <span className="text-sm font-medium text-slate-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={
                        authLoading ||
                        outOfStock ||
                        reachedStockLimit ||
                        Boolean(processingProductId) ||
                        (isAuthenticated && cartLoading)
                      }
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                        inCart
                          ? "bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700"
                          : "bg-orange-500 shadow-orange-500/20 hover:bg-orange-600"
                      }`}
                    >
                      {authLoading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Checking...
                        </>
                      ) : isProcessing || addingToCart ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Updating Cart...
                        </>
                      ) : outOfStock ? (
                        <>
                          <ShoppingCart size={17} />
                          Out of Stock
                        </>
                      ) : reachedStockLimit ? (
                        <>
                          <ShoppingCart size={17} />
                          Maximum Quantity Reached
                        </>
                      ) : inCart ? (
                        <>
                          <ShoppingCart size={17} />
                          Add Another ({currentQuantity} in cart)
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={17} />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isError && products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-[#40352b]">
            <Package size={45} className="mx-auto mb-4 text-orange-500" />

            <h3 className="text-xl font-bold">No Products Available</h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-stone-400">
              Check back later for new products.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-5 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Explore Shop
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
