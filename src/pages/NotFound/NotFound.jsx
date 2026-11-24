import { Home, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-8xl font-extrabold text-orange-600 md:text-9xl dark:text-orange-400">
        404
      </h1>

      <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
        Page Not Found
      </h2>

      <p className="mt-3 max-w-md text-lg text-white dark:text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          <Home size={18} />
          Go Home
        </Link>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-lg border  border-orange-500 px-6 py-3 font-semibold text-orange-600 transition  bg-orange-50 dark:border-orange-400 dark:text-orange-400  "
        >
          <Search size={18} />
          Browse Shop
        </Link>
      </div>
    </section>
  );
}
