import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronRight,
  Package,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../redux/features/orders/ordersApiSlice";

const STATUS = {
  pending: { label: "Pending", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "sky" },
  shipped: { label: "Shipped", tone: "violet" },
  delivered: { label: "Delivered", tone: "emerald" },
  cancelled: { label: "Cancelled", tone: "rose" },
};

function getStatus(raw) {
  const key = String(raw || "pending")
    .toLowerCase()
    .trim()
    .replace("canceled", "cancelled");
  const info = STATUS[key] || { label: key, tone: "slate" };
  return {
    key,
    label: info.label,
    tone: info.tone,
    active: key !== "delivered" && key !== "cancelled",
  };
}

function normalizeOrder(o) {
  if (!o) return null;

  const items = (o.items || []).map((item, idx) => ({
    key: item._id || item.product || idx,
    productId: item.product,
    name: item.name || "Product",
    image: item.image || null,
    quantity: item.quantity || 1,
    price: Number(item.price) || 0,
    subtotal: (Number(item.price) || 0) * (item.quantity || 1),
  }));

  return {
    id: o._id,
    number: `#${String(o._id).slice(-6).toUpperCase()}`,
    createdAt: o.createdAt,
    status: getStatus(o.status),
    items,
    itemsTotal: Number(o.subtotal) || 0,
    shipping: Number(o.shippingFee) || 0,
    discount: Number(o.discount) || 0,
    tax: Number(o.tax) || 0,
    total: Number(o.totalPrice) || 0,
    address: o.shippingAddress,
    paymentMethod: o.paymentMethod,
    isPaid: o.paymentStatus === "paid",
  };
}

const formatMoney = (n) =>
  new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" }).format(
    Number(n) || 0,
  );

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const itemsSummary = (order) => {
  const [first, ...rest] = order.items;
  if (!first) return "No items";
  if (!rest.length) return first.name;
  return `${first.name} and ${rest.length} more`;
};

const surface =
  "rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5";

const TONES = {
  amber: "bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-300",
  sky: "bg-sky-500/15 text-sky-700 ring-sky-500/30 dark:text-sky-300",
  violet:
    "bg-violet-500/15 text-violet-700 ring-violet-500/30 dark:text-violet-300",
  emerald:
    "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300",
  rose: "bg-rose-500/15 text-rose-700 ring-rose-500/30 dark:text-rose-300",
  slate: "bg-slate-500/15 text-slate-700 ring-slate-500/30 dark:text-slate-300",
};

function StatusChip({ status, className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 sm:text-xs ${TONES[status.tone] ?? TONES.slate} ${className}`}
    >
      {status.label}
    </span>
  );
}

function ProductThumb({
  src,
  alt = "",
  className = "h-12 w-12 sm:h-14 sm:w-14",
}) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-200/70 text-slate-400 dark:bg-white/10 dark:text-slate-500 ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Package size={18} aria-hidden="true" />
      )}
    </span>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-300/50 dark:bg-white/10 ${className}`}
    />
  );
}

const FILTERS = [
  { key: "all", label: "All", test: () => true },
  {
    key: "confirmed",
    label: "Confirmed",
    test: (o) => o.status.key === "confirmed",
  },
  {
    key: "delivered",
    label: "Delivered",
    test: (o) => o.status.key === "delivered",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    test: (o) => o.status.key === "cancelled",
  },
];

const PAGE_SIZE = 10;

function Thumbs({ items }) {
  const shown = items.slice(0, 3);
  const extra = items.length - shown.length;

  return (
    <div className="flex shrink-0 items-center">
      {shown.map((item, i) => (
        <ProductThumb
          key={item.key}
          src={item.image}
          className={`h-11 w-11 ring-2 ring-white dark:ring-slate-900 sm:h-14 sm:w-14 ${
            i ? "-ml-4 sm:-ml-5" : ""
          }`}
        />
      ))}
      {extra > 0 && (
        <span className="-ml-4 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-800 text-xs font-bold text-white ring-2 ring-white dark:bg-slate-700 dark:ring-slate-900 sm:-ml-5 sm:h-14 sm:w-14 sm:text-sm">
          +{extra}
        </span>
      )}
    </div>
  );
}

function OrderRow({ order, highlighted }) {
  return (
    <Link
      to={`/orders/${order.id}`}
      className={`${surface} group flex flex-col gap-3 p-3.5 transition-colors hover:border-orange-300 dark:hover:border-orange-400/40 sm:grid sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:gap-x-4 sm:p-4 ${
        highlighted ? "ring-2 ring-orange-500/60" : ""
      }`}
    >
      <div className="flex items-center gap-3 sm:contents">
        <Thumbs items={order.items} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white sm:text-base">
            Order {order.number}
          </p>
          <p className="truncate text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
            {itemsSummary(order)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <ChevronRight
          size={18}
          aria-hidden="true"
          className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500 sm:order-4 sm:justify-self-end"
        />
      </div>

      <div className="flex items-center justify-between border-t border-slate-200/70 pt-2.5 dark:border-white/10 sm:order-3 sm:flex-col sm:items-end sm:justify-center sm:gap-1.5 sm:border-t-0 sm:pt-0">
        <StatusChip status={order.status} />
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {formatMoney(order.total)}
        </span>
      </div>
    </Link>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      <span className="sr-only">Loading your orders</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${surface} flex items-center gap-3 p-3.5 sm:gap-4 sm:p-4`}
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl sm:h-14 sm:w-14" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32 sm:w-40" />
            <Skeleton className="h-3 w-48 max-w-full sm:w-64" />
          </div>
          <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function Notice({ icon: Icon, title, text, children }) {
  return (
    <div
      className={`${surface} flex flex-col items-center px-4 py-10 text-center sm:px-6 sm:py-14`}
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-500/10 text-orange-500">
        <Icon size={26} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white sm:text-lg">
        {title}
      </h2>
      <p className="mt-1 max-w-sm text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
        {text}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

const primaryBtn =
  "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition active:scale-95";
const ghostBtn =
  "inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-500 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-200";

export default function MyOrders() {
  const location = useLocation();
  const navigate = useNavigate();

  const [placed, setPlaced] = useState(() => location.state?.placed ?? false);
  const [placedId] = useState(() => location.state?.orderId ?? null);
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data, isLoading, isError, error, refetch } = useGetMyOrdersQuery(
    { limit: 100 },
    { refetchOnMountOrArgChange: true },
  );

  const orders = useMemo(() => {
    const rawList = Array.isArray(data?.orders) ? data.orders : [];
    return rawList
      .map(normalizeOrder)
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data]);

  useEffect(() => {
    if (location.state?.placed) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    setVisibleCount(PAGE_SIZE);
  };

  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const filtered = orders.filter(active.test);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const confirmedCount = orders.filter(
    (o) => o.status.key === "confirmed",
  ).length;

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 px-3 py-4 sm:px-6 sm:py-6">
      <header className="mb-5 sm:mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-orange-400 sm:text-3xl">
          My orders
        </h1>
        {!isLoading && !isError && (
          <p className="mt-1 text-xs text-white sm:text-sm">
            {orders.length === 0
              ? "You have not placed an order yet."
              : `${orders.length} ${orders.length === 1 ? "order" : "orders"}, ${confirmedCount} confirmed.`}
          </p>
        )}
      </header>

      <AnimatePresence>
        {placed && (
          <motion.div
            aria-live="polite"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-800 dark:text-emerald-200 sm:p-4">
              <PackageCheck
                size={20}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <p className="flex-1 text-xs font-medium sm:text-sm">
                Your order was placed. Its status will update here as it moves
                along.
              </p>
              <button
                type="button"
                onClick={() => setPlaced(false)}
                aria-label="Dismiss"
                className="shrink-0 rounded-full p-1 transition hover:bg-emerald-500/20"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <Notice
          icon={AlertTriangle}
          title="Could not load your orders"
          text={error?.data?.message || "Check your connection and try again."}
        >
          <button
            type="button"
            onClick={() => refetch()}
            className={primaryBtn}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Try again
          </button>
        </Notice>
      ) : orders.length === 0 ? (
        <Notice
          icon={ShoppingBag}
          title="No orders yet"
          text="When you place an order it will show up here, along with where it is."
        >
          <Link to="/shop" className={primaryBtn}>
            Browse the shop
          </Link>
        </Notice>
      ) : (
        <>
          <LayoutGroup id="orders-filter">
            <fieldset className="mb-4 flex max-w-full flex-wrap gap-1 rounded-2xl border border-slate-200/70 bg-white/60 p-1.5 shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-white/5 sm:inline-flex sm:rounded-full">
              <legend className="sr-only">Filter orders</legend>
              {FILTERS.map((f) => {
                const selected = f.key === filter;
                const count = orders.filter(f.test).length;
                return (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handleFilterChange(f.key)}
                    className={`relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                      selected
                        ? "text-white"
                        : "text-slate-600 hover:text-orange-500 dark:text-slate-300 dark:hover:text-white"
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="orders-filter-pill"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                        className="absolute inset-0 rounded-full bg-linear-to-r from-orange-500 to-orange-600 shadow-md shadow-orange-500/30"
                      />
                    )}
                    <span className="relative z-10">
                      {f.label} {count}
                    </span>
                  </button>
                );
              })}
            </fieldset>
          </LayoutGroup>

          {filtered.length === 0 ? (
            <Notice
              icon={ShoppingBag}
              title={`No ${active.label.toLowerCase()} orders`}
              text="Nothing matches this filter right now."
            >
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={ghostBtn}
              >
                Show all orders
              </button>
            </Notice>
          ) : (
            <>
              <ul className="space-y-3">
                {visible.map((order) => (
                  <li key={order.id}>
                    <OrderRow
                      order={order}
                      highlighted={order.id === placedId}
                    />
                  </li>
                ))}
              </ul>

              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className={ghostBtn}
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
