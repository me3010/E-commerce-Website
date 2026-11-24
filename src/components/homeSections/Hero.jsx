const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
function Hero() {
  return (
    <section className="relative isolate flex min-h-120 items-center overflow-hidden  border border-amber-600 rounded-2xl   transition-colors duration-300   sm:min-h-130 lg:min-h-142">
      <div className="pointer-events-none absolute -left-32 top-0 -z-10 h-100 w-100 rounded-full bg-white/70 blur-[130px] dark:bg-white/20  " />

      <div className="pointer-events-none absolute right-[10%] top-[10%] -z-10 h-78 w-78 rounded-full bg-white/70 blur-[130px] dark:bg-white/20 " />

      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-75 w-75 rounded-full bg-white/70 blur-[120px] dark:bg-white/20 " />

      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <motion.div
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 },
            },
          }}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-2xl"
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-4 py-2 dark:border-orange-500/20  "
          >
            <Sparkles size={15} className="text-orange-500" />

            <span className="text-xs font-semibold tracking-wider text-orange-600 dark:text-orange-400 sm:text-sm">
              PREMIUM SHOPPING EXPERIENCE
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-7xl"
          >
            Shop the future,
            <span className="mt-2 block bg-linear-to-r from-orange-500 via-orange-600 to-amber-600 bg-clip-text text-transparent dark:from-orange-400 dark:via-orange-500 dark:to-amber-600">
              delivered today.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="mt-6 max-w-lg text-sm leading-7 text-white/70 dark:text-stone-400 sm:text-base"
          >
            Discover premium products at unbeatable prices. Fast delivery, easy
            returns, and exceptional quality. Everything you need, all in one
            place.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:-translate-y-1 hover:from-orange-400 hover:to-orange-500 hover:shadow-xl hover:shadow-orange-500/30"
            >
              Shop Now
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("categories")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-orange-500 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300     hover:shadow-md hover:shadow-orange-500/10 dark:border-white/15    dark:hover:border-orange-500/50  "
            >
              <ShoppingBag size={17} />
              View Categories
            </button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="mt-10 flex items-center gap-3 text-xs text-slate-100 "
          >
            <span className="h-px w-10 bg-orange-500/60" />
            Quality products. Better prices. Faster delivery.
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
