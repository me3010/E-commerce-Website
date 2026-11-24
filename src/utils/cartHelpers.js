const PLACEHOLDER_IMAGE =
  "https://placehold.co/100x100/e2e8f0/94a3b8?text=No+Image";

export function getCart(body) {
  return body?.data || body?.cart || body || null;
}

export function getProductId(item) {
  return typeof item.product === "string"
    ? item.product
    : item.product?._id || item._id || item.productId;
}

export function getItemName(item) {
  return item.name || item.product?.name || item.product?.title || "Product";
}

export function getItemImage(item) {
  return (
    item.image ||
    item.product?.imageCover ||
    item.product?.images?.[0] ||
    PLACEHOLDER_IMAGE
  );
}

export function getItemPrice(item) {
  if (typeof item.price === "number") return item.price;
  const p = item.product;
  if (p?.discountPrice && p.discountPrice < p.price) return p.discountPrice;
  return p?.price || 0;
}

export function getCartTotals(cart) {
  const items = cart?.items || [];
  const subtotal = Number(
    cart?.subtotal ??
      cart?.totalPrice ??
      cart?.totalCartPrice ??
      items.reduce(
        (sum, i) => sum + getItemPrice(i) * (Number(i.quantity) || 0),
        0,
      ),
  );
  const discount = Number(cart?.discountAmount ?? cart?.discount ?? 0);
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = afterDiscount >= 1000 ? 0 : 50;
  const tax = Math.round(afterDiscount * 0.14);
  const total = afterDiscount + shipping + tax;

  return { subtotal, discount, afterDiscount, shipping, tax, total };
}

export function getErrorMessage(err, fallback = "Something went wrong") {
  return err?.data?.message || err?.message || fallback;
}
