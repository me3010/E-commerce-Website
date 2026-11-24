import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Heart,
  Loader2,
  MessageSquarePlus,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useMeQuery } from "../../redux/features/auth/authApiSlice";
import { useAddItemToCartMutation } from "../../redux/features/carts/cartApiSlice";
import {
  useAddProductReviewMutation,
  useDeleteProductReviewMutation,
  useGetAllProductsQuery,
  useGetProductReviewsQuery,
  useGetSingleProductQuery,
} from "../../redux/features/products/productsApiSlice";
import {
  useAddToWishlistMutation,
  useGetMyWishlistQuery,
  useRemoveFromWishlistMutation,
} from "../../redux/features/wishlists/wishlistApiSlice";
import ProductCard from "./ProductCard";

export default function ProductDetails() {
  const { id } = useParams();

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const showToast = (message, type = "error") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const marqueeWrapperRef = useRef(null);
  const marqueeTrackRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const offsetXRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const {
    data: productRes,
    isLoading,
    isError,
    refetch,
  } = useGetSingleProductQuery(id, { skip: !id });

  const { data: reviewsRes } = useGetProductReviewsQuery(id, { skip: !id });
  const { data: meRes } = useMeQuery();
  const { data: wishlistRes } = useGetMyWishlistQuery();

  const [addItemToCart, { isLoading: isAddingCart }] =
    useAddItemToCartMutation();
  const [addToWishlist, { isLoading: isAddingWish }] =
    useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWish }] =
    useRemoveFromWishlistMutation();
  const [addProductReview, { isLoading: isSubmittingReview }] =
    useAddProductReviewMutation();
  const [deleteProductReview, { isLoading: isDeletingReview }] =
    useDeleteProductReviewMutation();

  const product =
    productRes?.product ?? productRes?.data?.product ?? productRes;
  const currentUser = meRes?.user ?? meRes?.data?.user ?? meRes;
  const currentUserId = currentUser?._id ?? currentUser?.id;

  const { data: allProductsRes } = useGetAllProductsQuery(
    product?.category
      ? { category: product.category, limit: 12 }
      : { limit: 12 },
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset product view state on id change
  useEffect(() => {
    setSelectedImgIdx(0);
    setQuantity(1);
    setActiveTab("description");
  }, [id]);

  const images = useMemo(() => {
    const raw = product?.images ?? [];
    const urls = raw
      .map((img) => (typeof img === "string" ? img : img?.url))
      .filter(Boolean);
    return urls.length > 0
      ? urls
      : ["https://placehold.co/600x600/1e293b/f97316?text=Veroya+Store"];
  }, [product]);

  const wishlistIds = useMemo(() => {
    const items =
      wishlistRes?.wishlist?.products ??
      wishlistRes?.data?.wishlist?.products ??
      wishlistRes?.data?.products ??
      wishlistRes?.products ??
      wishlistRes?.data?.items ??
      wishlistRes?.items ??
      [];
    if (!Array.isArray(items)) return new Set();
    return new Set(
      items
        .map((item) =>
          typeof item === "string"
            ? item
            : (item?._id ?? item?.id ?? item?.product?._id ?? item?.productId),
        )
        .filter(Boolean),
    );
  }, [wishlistRes]);

  const isWishlisted = useMemo(() => wishlistIds.has(id), [wishlistIds, id]);

  const reviews = useMemo(() => {
    const list =
      reviewsRes?.reviews ??
      reviewsRes?.data?.reviews ??
      reviewsRes?.data ??
      product?.reviews ??
      [];
    return Array.isArray(list) ? list : [];
  }, [reviewsRes, product]);

  const relatedProducts = useMemo(() => {
    const list =
      allProductsRes?.products ??
      allProductsRes?.data?.products ??
      allProductsRes?.data ??
      [];
    if (!Array.isArray(list)) return [];
    const currentId = product?._id ?? product?.id ?? id;
    const sameCategory = list.filter(
      (item) => (item?._id ?? item?.id) !== currentId,
    );
    return sameCategory.slice(0, 8);
  }, [allProductsRes, product, id]);
  const marqueeItems = useMemo(
    () =>
      relatedProducts.flatMap((relProduct, itemIdx) => {
        const relId = relProduct?._id ?? relProduct?.id ?? `rel-${itemIdx}`;
        return [
          { key: `primary-${relId}`, product: relProduct },
          { key: `clone-${relId}`, product: relProduct },
        ];
      }),
    [relatedProducts],
  );
  const setMarqueePosition = (nextX) => {
    const track = marqueeTrackRef.current;
    if (!track) return;
    const halfWidth = track.scrollWidth / 2;
    if (halfWidth <= 0) return;
    let wrapped = nextX % halfWidth;
    if (wrapped > 0) wrapped -= halfWidth;
    offsetXRef.current = wrapped;
    track.style.transform = `translate3d(${wrapped}px, 0, 0)`;
  };

  useEffect(() => {
    if (relatedProducts.length === 0) return;
    let rafId;
    let lastTime = performance.now();
    const speed = 50;

    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const hovered = marqueeWrapperRef.current?.matches(":hover");
      const track = marqueeTrackRef.current;
      if (!isDraggingRef.current && !hovered && track) {
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0) {
          let wrapped = (offsetXRef.current - speed * dt) % halfWidth;
          if (wrapped > 0) wrapped -= halfWidth;
          offsetXRef.current = wrapped;
          track.style.transform = `translate3d(${wrapped}px, 0, 0)`;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [relatedProducts]);

  const handleMarqueePointerDown = (e) => {
    if (e.target.closest("button, a")) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX - offsetXRef.current;
    marqueeWrapperRef.current?.setPointerCapture?.(e.pointerId);
  };

  const handleMarqueePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    setMarqueePosition(e.clientX - startXRef.current);
  };

  const handleMarqueePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (e?.pointerId !== undefined) {
      marqueeWrapperRef.current?.releasePointerCapture?.(e.pointerId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 animate-pulse rounded-lg bg-white/40 dark:bg-white/10" />
        <div className="grid grid-cols-1 gap-8 rounded-3xl border border-slate-200/70 bg-white/60 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-black/45 lg:grid-cols-12">
          <div className="aspect-square animate-pulse rounded-2xl bg-slate-200/70 dark:bg-white/10 lg:col-span-5" />
          <div className="space-y-4 lg:col-span-7">
            <div className="h-8 w-3/4 animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/10" />
            <div className="h-5 w-1/3 animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/10" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/10" />
            <div className="h-12 w-1/2 animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product?._id) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-white/65 p-12 text-center backdrop-blur-xl dark:bg-black/45">
        <p className="mb-4 text-base font-bold text-red-500">
          Product not found or failed to load.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/30 hover:bg-orange-600"
          >
            Try Again
          </button>
          <Link
            to="/shop"
            className="rounded-xl border border-slate-300/80 px-5 py-2.5 text-xs font-bold text-slate-700 hover:border-orange-500 dark:border-white/15 dark:text-slate-200"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const price = Number(product.price ?? 0);
  const discountPrice = Number(product.discountPrice ?? 0);
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice : price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const stock = Number(product.stock ?? 0);
  const outOfStock = stock <= 0;
  const avgRating = Number(product.averageRating ?? 0);
  const numReviews = Number(product.numReviews ?? reviews.length);
  const wishLoading = isAddingWish || isRemovingWish;

  const handleAddToCart = async () => {
    if (isAddingCart || outOfStock) return;
    try {
      const res = await addItemToCart({ productId: id, quantity }).unwrap();
      console.log("Added to cart (Details):", {
        productId: id,
        quantity,
        response: res,
      });
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 1800);
      showToast("Added to cart successfully", "success");
    } catch (err) {
      console.error("Add to cart failed:", err);
      if (err?.status === 401) {
        showToast("Please login to add items to cart", "error");
      } else {
        showToast(err?.data?.message ?? "Could not add to cart", "error");
      }
    }
  };

  const handleToggleWishlist = async () => {
    if (wishLoading) return;
    try {
      if (isWishlisted) {
        const res = await removeFromWishlist(id).unwrap();
        console.log("Removed from wishlist (Details):", res);
        showToast("Removed from wishlist", "success");
      } else {
        const res = await addToWishlist(id).unwrap();
        console.log("Added to wishlist (Details):", {
          productId: id,
          response: res,
        });
        showToast("Added to wishlist", "success");
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
      if (err?.status === 401) {
        showToast("Please login to add items to wishlist", "error");
      } else {
        showToast(err?.data?.message ?? "Could not update wishlist", "error");
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    if (!comment.trim()) {
      setReviewError("Please write a short comment with your rating.");
      return;
    }

    try {
      const res = await addProductReview({
        id,
        rating,
        comment: comment.trim(),
      }).unwrap();
      console.log("Review submitted:", {
        productId: id,
        rating,
        response: res,
      });
      setComment("");
      setRating(5);
      setActiveTab("reviews");
      showToast("Review submitted successfully", "success");
    } catch (err) {
      console.error("Review submit failed:", err);
      if (err?.status === 401) {
        showToast("Please login to submit a review", "error");
        return;
      }
      setReviewError(
        err?.data?.message ?? "Could not submit review. Try again.",
      );
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (isDeletingReview || !reviewId) return;
    try {
      const res = await deleteProductReview({
        id,
        reviewId,
      }).unwrap();
      console.log("Review deleted:", {
        productId: id,
        reviewId,
        response: res,
      });
      showToast("Review deleted", "success");
    } catch (err) {
      console.error("Delete review failed:", err);
      if (err?.status === 401) {
        showToast("Please login to delete your review", "error");
      } else {
        showToast(err?.data?.message ?? "Could not delete review", "error");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-xs font-bold text-slate-700 backdrop-blur-md transition hover:border-orange-500 hover:text-orange-500 dark:border-white/10 dark:bg-black/50 dark:text-slate-200"
        >
          <ArrowLeft size={15} />
          Back to Shop
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 gap-8 rounded-3xl border border-slate-200/80 bg-white/50 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-black/50 sm:p-8 lg:grid-cols-12"
      >
        <div className="space-y-4 lg:col-span-5">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100/80 dark:border-white/10 dark:bg-white/5">
            <img
              src={images[selectedImgIdx] ?? images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-all duration-300"
            />
            {hasDiscount && (
              <span className="absolute left-3.5 top-3.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-extrabold text-white shadow-lg shadow-orange-500/30">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((imgUrl, idx) => (
                <button
                  key={imgUrl}
                  type="button"
                  onClick={() => setSelectedImgIdx(idx)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImgIdx === idx
                      ? "border-orange-500 ring-2 ring-orange-500/30"
                      : "border-transparent opacity-65 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {product.category && (
                <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-bold capitalize text-orange-600 dark:text-orange-400">
                  {product.category}
                </span>
              )}
              {product.brand && (
                <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {product.brand}
                </span>
              )}
              <span
                className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  outOfStock
                    ? "bg-red-500/15 text-red-500"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <Package size={13} />
                {outOfStock
                  ? "Out of Stock"
                  : stock <= 10
                    ? `Only ${stock} left`
                    : `In Stock (${stock})`}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-orange-500   sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <Star
                    key={starValue}
                    size={16}
                    className={
                      starValue <= Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-600"
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-orange-500  ">
                ({numReviews} {numReviews === 1 ? "review" : "reviews"})
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-3 border-y border-slate-200/70 py-4 dark:border-white/10">
              <span className="text-3xl font-black text-orange-600 dark:text-orange-400">
                EGP {finalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base font-medium text-slate-300 line-through">
                  EGP {price.toLocaleString()}
                </span>
              )}
            </div>

            {product.shortDescription && (
              <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {product.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              {product.sku && (
                <span>
                  SKU:{" "}
                  <strong className="text-slate-700 dark:text-slate-200">
                    {product.sku}
                  </strong>
                </span>
              )}
              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag size={13} className="text-orange-500" />
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-white/10 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {!outOfStock && (
                <div className="flex h-12 items-center rounded-2xl border border-slate-200/80 bg-white/80 px-2 dark:border-white/10 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="grid h-8 w-8 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-200/70 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center text-sm font-extrabold text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock}
                    aria-label="Increase quantity"
                    className="grid h-8 w-8 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-200/70 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingCart || outOfStock}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold transition-all ${
                  outOfStock
                    ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-500"
                    : addedFeedback
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 active:scale-[0.99]"
                }`}
              >
                {isAddingCart ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : outOfStock ? (
                  "Out of Stock"
                ) : addedFeedback ? (
                  <>
                    <Check size={18} />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={wishLoading}
                aria-label="Toggle wishlist"
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition-all ${
                  isWishlisted
                    ? "border-red-500/40 bg-red-500/15 text-red-500"
                    : "border-slate-200/80 bg-white/80 text-red-500 hover:border-orange-500 hover:text-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                }`}
              >
                {wishLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Heart
                    size={18}
                    className={isWishlisted ? "fill-red-500 text-red-500" : ""}
                  />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck size={15} className="text-orange-500" />
              <span>Fast delivery across Egypt & secure checkout</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        <div className="flex items-center gap-6 border-b border-slate-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`pb-3 text-sm font-bold transition-colors ${
              activeTab === "description"
                ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
                : "text-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-sm font-bold transition-colors ${
              activeTab === "reviews"
                ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
                : "text-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === "description" ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-black/50">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {product.description ||
                product.shortDescription ||
                "No detailed description available for this product."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-black/50 lg:col-span-5">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquarePlus size={18} className="text-orange-500" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Write a Review
                </h2>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Your Rating
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          size={22}
                          className={
                            star <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 dark:text-slate-600"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Your Comment
                  </span>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about quality, value, and experience..."
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 p-3 text-xs text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>

                {reviewError && (
                  <p className="text-xs font-semibold text-red-500">
                    {reviewError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/30 transition hover:from-orange-600 hover:to-orange-700 disabled:opacity-60"
                >
                  {isSubmittingReview ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-black/50 lg:col-span-7">
              <h2 className="mb-4 text-base font-extrabold text-slate-900 dark:text-white">
                Customer Reviews ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div className="space-y-3.5">
                  {reviews.map((rev) => {
                    const isMine =
                      currentUserId &&
                      (rev.user === currentUserId ||
                        rev.user?._id === currentUserId);
                    return (
                      <div
                        key={rev._id}
                        className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {rev.username ?? rev.user?.name ?? "Customer"}
                            </p>
                            <div className="mt-1 flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((starValue) => (
                                <Star
                                  key={starValue}
                                  size={12}
                                  className={
                                    starValue <= Number(rev.rating ?? 0)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-300 dark:text-slate-600"
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {rev.createdAt && (
                              <span className="text-[11px] text-slate-400">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            )}
                            {isMine && (
                              <button
                                type="button"
                                disabled={isDeletingReview}
                                onClick={() => handleDeleteReview(rev._id)}
                                aria-label="Delete review"
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="mt-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                          {rev.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-2">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Related Products
          </h2>

          <div
            ref={marqueeWrapperRef}
            onPointerDown={handleMarqueePointerDown}
            onPointerMove={handleMarqueePointerMove}
            onPointerUp={handleMarqueePointerUp}
            onPointerCancel={handleMarqueePointerUp}
            className={`select-none overflow-hidden py-2 touch-pan-y ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <div
              ref={marqueeTrackRef}
              className="flex w-max gap-4 will-change-transform"
            >
              {/* // biome-ignore lint/correctness/useExhaustiveDependencies: reset product view state on id change */}

              {[...relatedProducts, ...relatedProducts].map(
                (relProduct, idx) => {
                  const relId = relProduct?._id;
                  return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: duplicated marquee track requires index suffix for unique keys
                    <div key={`${relId}-${idx}`} className="w-64 shrink-0">
                      <ProductCard
                        product={relProduct}
                        isWishlisted={wishlistIds.has(relId)}
                      />
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
