import { ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyWishlist() {
  return (
    <div className="relative mx-auto w-fit max-w-md overflow-hidden rounded-3xl   bg-white/40 px-6 py-12 text-center backdrop-blur-xl sm:px-8 sm:py-16">
      <div className="relative mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-orange-50 text-red-500 border border-red-50  ">
        <Heart size={42} strokeWidth={1.6} />
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight text-orange-500">
        Your wishlist is empty
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white">
        Save items you love to your wishlist. They will be waiting for you here.
      </p>

      <Link
        to="/shop"
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600"
      >
        Browse Products
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
