import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  FileText,
  LockKeyhole,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useGetMyCartQuery } from "../../redux/features/carts/cartApiSlice";
import { usePlaceOrderMutation } from "../../redux/features/orders/ordersApiSlice";

const initialForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
  notes: "",
};

const money = (value) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const amount = (...values) => {
  const value = values.find((entry) => entry !== undefined && entry !== null);

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCart = (response) =>
  response?.data?.cart ?? response?.cart ?? response?.data ?? response ?? {};

const getItems = (cart) => {
  const items =
    cart?.items ??
    cart?.products ??
    cart?.cartItems ??
    cart?.data?.items ??
    cart?.data?.products;

  return Array.isArray(items) ? items : [];
};

const getProduct = (item) =>
  item?.product && typeof item.product === "object" ? item.product : item;

const getItemName = (item) => {
  const product = getProduct(item);

  return product?.name ?? product?.title ?? item?.name ?? "Product";
};

const getItemImage = (item) => {
  const product = getProduct(item);

  const image =
    product?.image ??
    product?.imageUrl ??
    product?.thumbnail ??
    product?.images?.[0] ??
    item?.image;

  return typeof image === "string" ? image : (image?.url ?? "");
};

const getQuantity = (item) => amount(item?.quantity, item?.qty, 1);

const getUnitPrice = (item) => {
  const product = getProduct(item);

  return amount(item?.unitPrice, item?.price, product?.price);
};

const getOrderId = (response) =>
  response?.order?._id ??
  response?.order?.id ??
  response?.data?.order?._id ??
  response?.data?.order?.id ??
  response?.data?._id ??
  response?.data?.id ??
  response?._id ??
  response?.id ??
  "";

const inputClass =
  "mt-2 w-full min-w-0 rounded-xl border border-black/10 bg-white/65 px-4 py-3.5 text-sm text-black outline-none transition-all duration-300 placeholder:text-black/40 hover:border-orange-300 focus:border-orange-500 focus:bg-white/85 focus:ring-4 focus:ring-orange-500/10 dark:border-white/10 dark:bg-black/25 dark:text-white dark:placeholder:text-white/40 dark:hover:border-orange-400/60 dark:focus:bg-black/25 dark:focus:ring-orange-500/20";

const labelClass =
  "block min-w-0 text-sm font-semibold text-black/80 dark:text-white/80";

const cardClass =
  "min-w-0 rounded-[26px]   bg-white/20 p-5 shadow-xl   transition-all duration-300    sm:rounded-[28px] sm:p-7 lg:p-8";

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-7 flex items-center gap-3 sm:gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500/10 text-orange-500 sm:h-12 sm:w-12">
        <Icon size={22} />
      </div>

      <div className="min-w-0">
        <h2 className="text-base font-bold text-black dark:text-white sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-black/60 dark:text-white/60 sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Checkout() {
  const {
    data: cartResponse,
    isLoading,
    isError,
    refetch,
  } = useGetMyCartQuery();

  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
  const [form, setForm] = useState(initialForm);
  const [orderError, setOrderError] = useState("");
  const navigate = useNavigate();

  const cart = getCart(cartResponse);
  const items = getItems(cart);

  const totals = useMemo(() => {
    const itemsTotal = items.reduce(
      (sum, item) => sum + getUnitPrice(item) * getQuantity(item),
      0,
    );

    const subtotal = amount(
      cart?.subtotal,
      cart?.itemsPrice,
      cart?.totalItemsPrice,
      itemsTotal,
    );

    const shippingValue =
      cart?.shippingFee ??
      cart?.shippingPrice ??
      cart?.deliveryFee ??
      cart?.shippingCost;

    const shipping = shippingValue == null ? null : amount(shippingValue);

    const discount = amount(cart?.discountAmount, cart?.discount);

    const total = amount(
      cart?.totalPrice,
      subtotal + (shipping ?? 0) - discount,
    );

    return {
      subtotal,
      shipping,
      discount,
      total,
    };
  }, [cart, items]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setOrderError("");

    try {
      const orderResponse = await placeOrder({
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          country: form.country.trim(),
          city: form.city.trim(),
          address: form.address.trim(),
          postalCode: form.postalCode.trim(),
        },
        paymentMethod: "cash",
        customerNote: form.notes.trim(),
      }).unwrap();

      if (orderResponse?.success === false) {
        throw new Error(
          orderResponse?.message || "Order failed. Please try again.",
        );
      }

      const createdOrder = orderResponse?.order ?? orderResponse;
      const orderId = getOrderId(orderResponse);

      toast.success(orderResponse?.message || "Order placed successfully!", {
        toastId: "order-success",
        autoClose: 1800,
      });

      navigate(orderId ? `/order-success/${orderId}` : "/order-success", {
        replace: true,
        state: {
          order: createdOrder,
          orderResponse,
          orderId,
        },
      });
    } catch (error) {
      console.error("ORDER ERROR:", error);
      console.error("ERROR DATA:", error?.data);

      const backendMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        error?.message;

      const message = backendMessage
        ? `Order failed: ${backendMessage}. Please try again.`
        : "Order failed. Please try again.";

      setOrderError(message);

      toast.error(message, {
        toastId: "order-failed",
        autoClose: 4000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center  transition-colors ">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />

          <p className="font-semibold  text-white/70">
            Preparing your checkout...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh]  px-4 py-16 transition-colors  sm:py-20">
        <div className={`mx-auto max-w-xl ${cardClass} text-center`}>
          <ShoppingBag className="mx-auto mb-5 h-14 w-14 text-orange-500" />

          <h1 className="text-xl font-bold text-black dark:text-white sm:text-2xl">
            Unable to load your cart
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">
            Something went wrong while loading your order. Please try again.
          </p>

          <button
            type="button"
            onClick={refetch}
            className="mt-7 rounded-full bg-orange-500 px-8 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-[70vh]  px-4 py-16 transition-colors  sm:py-20">
        <div className={`mx-auto max-w-xl ${cardClass} text-center`}>
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl   text-orange-500">
            <ShoppingBag size={38} />
          </div>

          <h1 className="text-2xl font-bold text-black dark:text-white">
            Your Cart Is Empty
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">
            Discover something special and come back to complete your order.
          </p>

          <Link
            to="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 font-bold text-white transition hover:bg-orange-600"
          >
            Explore Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="relative isolate mx-2 my-4 min-h-screen overflow-hidden rounded-[26px]    px-3 py-8 text-black shadow-xl transition-colors duration-500 dark:border-white/10 dark:text-white sm:mx-4 sm:my-6 sm:rounded-[36px] sm:px-6 sm:py-10 lg:mx-5 lg:my-8 lg:rounded-[44px] lg:px-10 lg:py-14">
      <div
        className="absolute inset-0 z-0 bg-white/20 backdrop-blur-md transition-colors duration-500 "
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="mb-7 flex flex-wrap items-center gap-2 text-xs text-black/70 dark:text-white/70 sm:mb-9 sm:text-sm">
          <Link to="/" className="transition hover:text-orange-500">
            Home
          </Link>

          <span>/</span>

          <Link to="/cart" className="transition hover:text-orange-500">
            Cart
          </Link>

          <span>/</span>

          <span className="font-bold text-orange-600 dark:text-orange-400">
            Checkout
          </span>
        </div>

        <div className="mb-9 sm:mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600 dark:border-orange-400/20 dark:text-orange-400 sm:px-4 sm:text-xs">
            <LockKeyhole size={15} />
            Secure Checkout
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight    text-white sm:text-4xl lg:text-5xl">
            Complete Your Order
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-black/70 dark:text-white/70 sm:mt-4 sm:text-base">
            You're just one step away from your purchase. Fill in your delivery
            details below.
          </p>
        </div>

        <div className="mb-9 flex w-full max-w-xl items-center gap-2 sm:mb-12 sm:gap-3">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white shadow-md sm:h-10 sm:w-10">
              <Check size={16} />
            </span>

            <span className="text-xs font-semibold text-black/80 dark:text-white/80 sm:text-sm">
              Cart
            </span>
          </div>

          <div className="h-1 min-w-3 flex-1 rounded-full bg-orange-400/70" />

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-sm font-bold text-white shadow-lg shadow-orange-500/20 ring-4 ring-orange-500/10 sm:h-10 sm:w-10 sm:text-base">
              2
            </span>

            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 sm:text-sm">
              Checkout
            </span>
          </div>

          <div className="h-1 min-w-3 flex-1 rounded-full bg-black/15 dark:bg-white/20" />

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm text-black/50 dark:bg-white/10 dark:text-white/60 sm:h-10 sm:w-10 sm:text-base">
              3
            </span>

            <span className="text-xs font-semibold text-black/50 dark:text-white/60 sm:text-sm">
              Complete
            </span>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="min-w-0 space-y-6 sm:space-y-7"
          >
            <section className={cardClass}>
              <SectionHeading
                icon={MapPin}
                title="Delivery Information"
                description="Enter your details for a smooth delivery."
              />

              <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <UserRound size={16} className="shrink-0 text-orange-500" />
                    Full Name
                  </span>

                  <input
                    autoComplete="name"
                    className={inputClass}
                    name="fullName"
                    onChange={updateField}
                    placeholder="Enter your full name"
                    required
                    value={form.fullName}
                  />
                </label>

                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Phone size={16} className="shrink-0 text-orange-500" />
                    Phone Number
                  </span>

                  <input
                    autoComplete="tel"
                    className={inputClass}
                    name="phone"
                    onChange={updateField}
                    placeholder="+20 1XX XXX XXXX"
                    required
                    type="tel"
                    value={form.phone}
                  />
                </label>

                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="shrink-0 text-orange-500" />
                    Street Address
                  </span>

                  <input
                    autoComplete="street-address"
                    className={inputClass}
                    name="address"
                    onChange={updateField}
                    placeholder="Building, street, apartment..."
                    required
                    value={form.address}
                  />
                </label>

                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Building2 size={16} className="shrink-0 text-orange-500" />
                    City
                  </span>

                  <input
                    autoComplete="address-level2"
                    className={inputClass}
                    name="city"
                    onChange={updateField}
                    placeholder="Enter your city"
                    required
                    value={form.city}
                  />
                </label>

                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="shrink-0 text-orange-500" />
                    Country
                  </span>

                  <input
                    autoComplete="country-name"
                    className={inputClass}
                    name="country"
                    onChange={updateField}
                    placeholder="Enter your country"
                    required
                    value={form.country}
                  />
                </label>

                <label className={labelClass}>
                  Postal Code
                  <span className="ml-1 font-normal text-black/60 dark:text-white/60">
                    (Optional)
                  </span>
                  <input
                    autoComplete="postal-code"
                    className={inputClass}
                    name="postalCode"
                    onChange={updateField}
                    placeholder="Postal code"
                    value={form.postalCode}
                  />
                </label>

                <label className={labelClass}>
                  <span className="flex flex-wrap items-center gap-2">
                    <FileText size={16} className="shrink-0 text-orange-500" />
                    Delivery Notes
                    <span className="font-normal text-black/60 dark:text-white/60">
                      (Optional)
                    </span>
                  </span>

                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    name="notes"
                    onChange={updateField}
                    placeholder="Additional instructions for delivery..."
                    rows={3}
                    value={form.notes}
                  />
                </label>
              </div>
            </section>

            <section className={cardClass}>
              <SectionHeading
                icon={CreditCard}
                title="Payment Method"
                description="Choose how you would like to pay."
              />

              <div className="rounded-2xl border-2 border-orange-400/80 bg-orange-50/80 p-4 transition-colors dark:bg-orange-500/5 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-orange-500 shadow-sm dark:bg-white/10 sm:h-12 sm:w-12">
                    <Truck size={24} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-black dark:text-white sm:text-base">
                      Cash on Delivery
                    </h3>

                    <p className="mt-1 text-xs text-black/60 dark:text-white/60">
                      Pay when your order arrives.
                    </p>
                  </div>

                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-500 text-white">
                    <Check size={15} />
                  </div>
                </div>

                <div className="mt-5 border-t border-orange-200/70 pt-4 dark:border-orange-500/20">
                  <p className="text-xs leading-6 text-black/70 dark:text-white/60">
                    Your payment will be collected by the delivery
                    representative when your products are delivered.
                  </p>
                </div>
              </div>
            </section>

            {orderError && (
              <div
                className="wrap-break-word  rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 sm:px-5"
                role="alert"
              >
                {orderError}
              </div>
            )}
          </form>

          <aside className="min-w-0 w-full lg:sticky lg:top-6">
            <div className={cardClass}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-black dark:text-white sm:text-xl">
                    Order Summary
                  </h2>

                  <p className="mt-1 text-xs text-black/60 dark:text-white/60 sm:text-sm">
                    Review your items
                  </p>
                </div>

                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500 sm:h-12 sm:w-12">
                  <ShoppingBag size={22} />
                </div>
              </div>

              <div className="mt-6 max-h-80 space-y-5 overflow-y-auto pr-1 sm:mt-7">
                {items.map((item, index) => {
                  const product = getProduct(item);
                  const image = getItemImage(item);
                  const quantity = getQuantity(item);
                  const price = getUnitPrice(item);

                  const key =
                    item?._id ??
                    item?.id ??
                    product?._id ??
                    product?.id ??
                    `${getItemName(item)}-${index}`;

                  return (
                    <div key={key} className="group flex min-w-0 gap-3">
                      <div className="relative h-17 w-17 shrink-0 overflow-hidden rounded-xl bg-black/5 ring-1 ring-black/10 dark:bg-white/10 dark:ring-white/10 sm:h-19 sm:w-19 sm:rounded-2xl">
                        {image ? (
                          <img
                            src={image}
                            alt={getItemName(item)}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <ShoppingBag className="m-auto h-full w-full p-5 text-black/40 dark:text-white/50" />
                        )}

                        <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">
                          {quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 wrap-break-word  text-sm font-bold text-black/80 dark:text-white">
                          {getItemName(item)}
                        </h3>

                        <p className="mt-2 text-xs text-black/60 dark:text-white/60">
                          Qty: {quantity}
                        </p>

                        <p className="mt-1 text-sm font-bold text-orange-600 dark:text-orange-400">
                          {money(price * quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="my-6 border-t border-dashed border-black/10 dark:border-white/10" />

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-black/60 dark:text-white/60">
                    Subtotal
                  </span>

                  <span className="text-right font-semibold text-black/80 dark:text-white">
                    {money(totals.subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-black/60 dark:text-white/60">
                    Delivery Fee
                  </span>

                  <span className="max-w-[60%] text-right font-semibold text-black/80 dark:text-white">
                    {totals.shipping == null
                      ? "Calculated after order"
                      : totals.shipping
                        ? money(totals.shipping)
                        : "Free"}
                  </span>
                </div>

                {totals.discount > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Discount
                    </span>

                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      -{money(totals.discount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="my-6 border-t border-black/10 dark:border-white/10" />

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-black dark:text-white sm:text-base">
                    {totals.shipping == null && cart?.totalPrice == null
                      ? "Estimated Total"
                      : "Total Amount"}
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-black/60 dark:text-white/60 sm:text-xs">
                    Inclusive of displayed discounts
                  </p>
                </div>

                <span className="shrink-0 text-xl font-extrabold text-orange-500 sm:text-2xl">
                  {money(totals.total)}
                </span>
              </div>

              {totals.shipping == null && cart?.totalPrice == null && (
                <p className="mt-3 text-xs leading-5 text-black/60 dark:text-white/60">
                  Delivery cost will be confirmed after your order.
                </p>
              )}

              <button
                type="submit"
                form="checkout-form"
                disabled={isPlacingOrder}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-orange-500 to-orange-400 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:gap-3 sm:text-base"
              >
                {isPlacingOrder ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Placing Your Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <ArrowRight size={19} />
                  </>
                )}
              </button>

              <div className="mt-6 grid grid-cols-2 gap-x-2 gap-y-4 border-t border-black/10 pt-5 dark:border-white/10">
                <div className="flex items-center gap-2 text-[10px] text-black/60 dark:text-white/60 sm:text-xs">
                  <LockKeyhole size={16} className="shrink-0 text-orange-500" />
                  Secure Checkout
                </div>

                <div className="flex items-center gap-2 text-[10px] text-black/60 dark:text-white/60 sm:text-xs">
                  <ShieldCheck size={16} className="shrink-0 text-orange-500" />
                  Protected Order
                </div>

                <div className="col-span-2 flex items-center justify-center gap-2 text-xs text-black/60 dark:text-white/60">
                  <PackageCheck size={16} className="text-orange-500" />
                  Reliable Delivery
                </div>
              </div>
            </div>

            <Link
              to="/cart"
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-black/70 transition-all duration-300 hover:bg-orange-50 hover:text-orange-600 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-orange-400 sm:mt-5"
            >
              <ArrowLeft size={17} />
              Return to Shopping Cart
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
