import { motion } from "framer-motion";
import { LoaderCircle, PackageOpen, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const getProduct = (item) => item?.product ?? item?.productDetails ?? item;

const getId = (item) => {
  const product = getProduct(item);

  return (
    product?._id ?? product?.id ?? item?.productId ?? item?._id ?? item?.id
  );
};

const getImage = (product) => {
  const image = product?.images?.[0] ?? product?.image ?? product?.thumbnail;

  return typeof image === "string" ? image : (image?.url ?? "");
};

const formatPrice = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? new Intl.NumberFormat("en-EG", {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 0,
      }).format(number)
    : "Price unavailable";
};

export default function WishlistProducts({
  items,
  busyId,
  isRemoving,
  isAdding,
  handleRemove,
  handleAddToCart,
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {items.map((item, index) => {
        const product = getProduct(item);
        const id = getId(item);
        const image = getImage(product);

        const name = product?.name ?? product?.title ?? "Product";

        const price = product?.discountPrice ?? product?.price;

        const oldPrice = product?.discountPrice ? product?.price : null;

        const outOfStock =
          product?.stock !== undefined && Number(product.stock) <= 0;

        const isRemovingThis = busyId === id && isRemoving;
        const isAddingThis = busyId === id && isAdding;

        return (
          <motion.article
            key={id ?? `${name}-${index}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: index * 0.06,
            }}
            className="group min-w-0 overflow-hidden rounded-3xl border border-orange-200/80 bg-white/60 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-orange-400    hover:shadow-xl hover:shadow-orange-500/10 dark:border-orange-500/20 dark:bg-white/5 dark:hover:border-orange-400/50 dark:hover:shadow-black/20"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-orange-50/70 dark:bg-slate-800">
              <Link to={`/products/${id}`} className="block h-full w-full">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-orange-300 dark:text-slate-500">
                    <PackageOpen size={48} strokeWidth={1.2} />
                  </div>
                )}
              </Link>
            </div>

            <div className="p-5">
              <Link to={`/products/${id}`} className="block ">
                <h2 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-800 transition-colors duration-300 hover:text-orange-500 dark:text-slate-100 dark:hover:text-orange-400">
                  {name}
                </h2>
              </Link>

              <div className="mt-2 flex min-h-7 flex-wrap items-center gap-2">
                <span className="text-lg font-extrabold text-orange-500">
                  {formatPrice(price)}
                </span>

                {oldPrice != null && Number(oldPrice) > Number(price) && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(oldPrice)}
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAddToCart(item)}
                  disabled={!id || isAddingThis || outOfStock}
                  className="group/btn flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isAddingThis ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <ShoppingCart
                      size={17}
                      className="text-red-600 transition-transform duration-200 group-hover/btn:-rotate-12 group-hover/btn:scale-110"
                    />
                  )}
                  {outOfStock ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  disabled={!id || isRemovingThis}
                  aria-label={`Remove ${name} from wishlist`}
                  title="Remove from wishlist"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-red-500   text-red-500 transition duration-200 hover:-translate-y-0.5     active:scale-95 disabled:cursor-not-allowed disabled:opacity-50      "
                >
                  {isRemovingThis ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Trash2
                      size={18}
                      className="transition-transform duration-200 hover:scale-110"
                    />
                  )}
                </button>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
