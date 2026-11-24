import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Check,
  CreditCard,
  MapPin,
  Package,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useCancelOrderMutation,
  useGetSingleOrderQuery,
} from "../../redux/features/orders/ordersApiSlice";

const STATUS = {
  pending: { label: "Pending", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "sky" },
  processing: { label: "Processing", tone: "indigo" },
  shipped: { label: "Shipped", tone: "violet" },
  delivered: { label: "Delivered", tone: "emerald" },
  cancelled: { label: "Cancelled", tone: "rose" },
};

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

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
    step: Math.max(0, STEPS.indexOf(key)),
    cancellable: !["shipped", "delivered", "cancelled"].includes(key),
  };
}

function normalizeOrder(o) {
  if (!o) return null;

  const items = (o.items || []).map((item, idx) => {
    const productId =
      typeof item.product === "object" ? item.product?._id : item.product;
    const price = Number(item.price) || 0;
    const quantity = item.quantity || 1;
    return {
      key: item._id || productId || idx,
      productId,
      name: item.name || "Product",
      image: item.image || null,
      quantity,
      price,
      subtotal: price * quantity,
    };
  });

  const itemsTotal =
    Number(o.subtotal) || items.reduce((sum, i) => sum + i.subtotal, 0);

  return {
    id: o._id,
    number: `#${String(o._id).slice(-6).toUpperCase()}`,
    createdAt: o.createdAt,
    status: getStatus(o.status),
    items,
    itemsTotal,
    shipping: Number(o.shippingFee) || 0,
    discount: Number(o.discount) || 0,
    tax: Number(o.tax) || 0,
    total: Number(o.totalPrice) || itemsTotal,
    address: o.shippingAddress,
    paymentMethod: o.paymentMethod,
    isPaid: o.paymentStatus === "paid",
  };
}

const formatMoney = (n) =>
  new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" }).format(
    Number(n) || 0,
  );

const formatDate = (d, withTime = false) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "";

const TIMELINE = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function formatAddress(a) {
  if (!a) return null;
  if (typeof a === "string") return { name: "", phone: "", lines: [a] };
  return {
    name: a.fullName || "",
    phone: a.phone || "",
    lines: [
      a.address,
      [a.city, a.country].filter(Boolean).join(", "),
      a.postalCode,
    ].filter(Boolean),
  };
}

function formatPayment(m) {
  if (!m) return "";
  if (/cash|cod/i.test(m)) return "Cash on delivery";
  if (/card|visa|stripe|paymob/i.test(m)) return "Card";
  return m;
}

const surface =
  "rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5";

const TONES = {
  amber: " bg-white/70 text-amber-700 ring-amber-500/30 ",
  sky: "bg-white/70 text-sky-700 ring-sky-500/30   ",
  indigo: "bg-white/70 text-indigo-700 ring-indigo-500/30  ",
  violet: "bg-white/70 text-violet-700 ring-violet-500/30  ",
  emerald: "bg-white/70 text-emerald-700 ring-emerald-500/30  ",
  rose: "bg-white/70 text-rose-700 ring-rose-500/30  ",
  slate: "bg-white/70 text-slate-700 ring-slate-500/30  ",
};

function StatusChip({ status, className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${TONES[status.tone] ?? TONES.slate} ${className}`}
    >
      {status.label}
    </span>
  );
}

function ProductThumb({ src, alt = "", className = "h-14 w-14" }) {
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

function Progress({ status }) {
  if (status.key === "cancelled") {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-rose-500/10 p-3.5 text-rose-800 dark:text-rose-200 sm:p-4">
        <Ban size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs font-medium sm:text-sm">
          This order was cancelled.
        </p>
      </div>
    );
  }

  const totalSegments = TIMELINE.length - 1;
  const fillPercent = Math.min(
    100,
    Math.max(0, (status.step / totalSegments) * 100),
  );

  return (
    <div className="overflow-x-auto py-1.5 sm:py-2">
      <div className="relative min-w-108 sm:min-w-130">
        <div
          aria-hidden="true"
          className="absolute left-[10%] right-[10%] top-4 h-0.5 bg-slate-200 dark:bg-white/15 sm:top-5"
        />
        <div
          aria-hidden="true"
          style={{ width: `${fillPercent * 0.8}%` }}
          className="absolute left-[10%] top-4 h-0.5 bg-orange-500 transition-all duration-300 sm:top-5"
        />

        <ol className="relative z-10 grid grid-cols-5 items-start text-center">
          {TIMELINE.map((step, i) => {
            const reached = i <= status.step;
            const current = i === status.step;
            return (
              <li
                key={step.key}
                className="flex flex-col items-center gap-2 sm:gap-2.5"
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full border transition-colors sm:h-10 sm:w-10 ${
                    reached
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-slate-200 bg-slate-100 text-slate-400 dark:border-white/15 dark:bg-slate-800 dark:text-slate-400"
                  } ${current ? "ring-4 ring-orange-500/20" : ""}`}
                >
                  {reached ? (
                    <Check size={15} strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    <span className="h-3 w-3 rounded-full border-2 border-current sm:h-3.5 sm:w-3.5" />
                  )}
                </span>

                <span
                  className={`text-[11px] font-semibold sm:text-sm ${
                    reached
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-slate-400 dark:text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        strong
          ? "border-t border-slate-200/80 pt-3 text-sm font-extrabold text-slate-900 dark:border-white/10 dark:text-white sm:text-base"
          : "text-xs text-slate-600 dark:text-slate-300 sm:text-sm"
      }`}
    >
      <dt>{label}</dt>
      <dd className="shrink-0">{value}</dd>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div
      className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_20rem]"
      aria-busy="true"
    >
      <span className="sr-only">Loading order</span>
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-56 rounded-2xl sm:h-64" />
        <Skeleton className="h-44 rounded-2xl sm:h-56" />
      </div>
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-44 rounded-2xl sm:h-48" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}

const backLink =
  "inline-flex items-center gap-1.5 text-xs font-semibold text-white transition hover:text-orange-500 sm:text-sm";

export default function OrderDetails() {
  const { id } = useParams();
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { data, isLoading, isError, error, refetch } = useGetSingleOrderQuery(
    id,
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();

  const order = useMemo(() => normalizeOrder(data?.order), [data]);
  const address = formatAddress(order?.address);

  const handleCancel = async () => {
    try {
      await cancelOrder(id).unwrap();
      setConfirming(false);
      setFeedback({ type: "success", text: "Order cancelled successfully." });
    } catch (err) {
      setFeedback({
        type: "error",
        text:
          err?.data?.message || "The order could not be cancelled. Try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl min-w-0 px-3 py-4 sm:px-6 sm:py-6">
        <Skeleton className="mb-6 h-8 w-44 sm:w-56" />
        <DetailsSkeleton />
      </div>
    );
  }

  if (isError || !order) {
    const missing = error?.status === 404;
    return (
      <div className="mx-auto w-full max-w-5xl min-w-0 px-3 py-4 sm:px-6 sm:py-6">
        <Link to="/orders" className={backLink}>
          <ArrowLeft size={16} aria-hidden="true" />
          My orders
        </Link>
        <div
          className={`${surface} mt-6 flex flex-col items-center px-4 py-10 text-center sm:px-6 sm:py-14`}
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-500/10 text-orange-500">
            <AlertTriangle size={26} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            {missing ? "Order not found" : "Could not load this order"}
          </h1>
          <p className="mt-1 max-w-sm text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
            {missing
              ? "It may belong to another account, or the link is out of date."
              : error?.data?.message || "Check your connection and try again."}
          </p>
          {!missing && (
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition active:scale-95"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 px-3 py-4 sm:px-6 sm:py-6">
      <Link to="/orders" className={backLink}>
        <ArrowLeft size={16} aria-hidden="true" />
        My orders
      </Link>

      <header className="mb-5 mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mb-6 sm:gap-x-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-orange-500 sm:text-3xl">
          Order {order.number}
        </h1>
        <StatusChip status={order.status} />
        {order.createdAt && (
          <p className="w-full text-xs text-white sm:text-sm">
            Placed on {formatDate(order.createdAt, true)}
          </p>
        )}
      </header>

      <AnimatePresence>
        {feedback && (
          <motion.p
            role={feedback.type === "error" ? "alert" : undefined}
            aria-live="polite"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-5 rounded-xl px-4 py-3 text-xs font-medium sm:text-sm ${
              feedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                : "bg-rose-500/10 text-rose-800 dark:text-rose-200"
            }`}
          >
            {feedback.text}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <section
            className={`${surface} p-4 sm:p-5`}
            aria-labelledby="items-title"
          >
            <h2
              id="items-title"
              className="mb-3.5 text-base font-bold text-slate-900 dark:text-white sm:mb-4 sm:text-lg"
            >
              Items
            </h2>
            <ul className="divide-y divide-slate-200/80 dark:divide-white/10">
              {order.items.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 sm:gap-4"
                >
                  <ProductThumb
                    src={item.image}
                    className="h-12 w-12 sm:h-16 sm:w-16"
                  />
                  <div className="min-w-0 flex-1">
                    {item.productId ? (
                      <Link
                        to={`/products/${item.productId}`}
                        className="line-clamp-2 text-xs font-semibold text-slate-900 transition hover:text-orange-500 dark:text-white sm:text-sm"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <p className="line-clamp-2 text-xs font-semibold text-slate-900 dark:text-white sm:text-sm">
                        {item.name}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                      {item.quantity} x {formatMoney(item.price)}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                    {formatMoney(item.subtotal)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={`${surface} p-4 sm:p-5`}
            aria-labelledby="progress-title"
          >
            <h2
              id="progress-title"
              className="mb-3.5 text-base font-bold text-slate-900 dark:text-white sm:mb-4 sm:text-lg"
            >
              Order Progress
            </h2>
            <Progress status={order.status} />
          </section>
        </div>

        <aside className="min-w-0 space-y-4 sm:space-y-6">
          <section
            className={`${surface} p-4 sm:p-5`}
            aria-labelledby="summary-title"
          >
            <h2
              id="summary-title"
              className="mb-3.5 text-base font-bold text-slate-900 dark:text-white sm:mb-4 sm:text-lg"
            >
              Summary
            </h2>
            <dl className="space-y-2.5">
              <Row label="Items" value={formatMoney(order.itemsTotal)} />
              {order.shipping > 0 && (
                <Row label="Shipping" value={formatMoney(order.shipping)} />
              )}
              {order.discount > 0 && (
                <Row
                  label="Discount"
                  value={`-${formatMoney(order.discount)}`}
                />
              )}
              {order.tax > 0 && (
                <Row label="Tax" value={formatMoney(order.tax)} />
              )}
              <Row strong label="Total" value={formatMoney(order.total)} />
            </dl>
          </section>

          {(address || order.paymentMethod) && (
            <section className={`${surface} space-y-4 p-4 sm:space-y-5 sm:p-5`}>
              {address && (
                <div className="flex gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-orange-500"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                    <h2 className="font-bold text-slate-900 dark:text-white">
                      Delivery address
                    </h2>
                    {address.name && (
                      <p className="wrap-break-word">{address.name}</p>
                    )}
                    {address.lines.map((line) => (
                      <p key={line} className="wrap-break-word">
                        {line}
                      </p>
                    ))}
                    {address.phone && (
                      <p className="wrap-break-word">{address.phone}</p>
                    )}
                  </div>
                </div>
              )}
              {order.paymentMethod && (
                <div className="flex gap-3">
                  <CreditCard
                    size={18}
                    className="mt-0.5 shrink-0 text-orange-500"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                    <h2 className="font-bold text-slate-900 dark:text-white">
                      Payment
                    </h2>
                    <p className="wrap-break-word">
                      {formatPayment(order.paymentMethod)}
                      {order.isPaid ? ", paid" : ""}
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {order.status.cancellable && (
            <section className={`${surface} p-4 sm:p-5`}>
              <AnimatePresence mode="wait" initial={false}>
                {confirming ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-xs font-semibold text-slate-900 dark:text-white sm:text-sm">
                      Cancel this order?
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                      This cannot be undone.
                    </p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setConfirming(false)}
                        disabled={cancelling}
                        className="flex-1 rounded-full border border-slate-200/80 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-300 disabled:opacity-50 dark:border-white/10 dark:text-slate-200 sm:text-sm"
                      >
                        Keep order
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex-1 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 active:scale-95 disabled:opacity-50 sm:text-sm"
                      >
                        Cancel order
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="ask"
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      setFeedback(null);
                      setConfirming(true);
                    }}
                    className="w-full rounded-full border border-rose-500/40 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-300 sm:text-sm"
                  >
                    Cancel order
                  </motion.button>
                )}
              </AnimatePresence>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
