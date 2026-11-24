import { motion } from "framer-motion";
import { House, Laptop, Shirt } from "lucide-react";

const categories = [
  {
    name: "Browse Products",
    description: "Explore our wide range of premium products",
    icon: Laptop,
  },
  {
    name: "Add to Cart",
    description: "Select your favorites and add them to your cart",
    icon: House,
  },
  {
    name: "Order & Receive",
    description: "Place your order and get it delivered to your doorstep",
    icon: Shirt,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function Work() {
  return (
    <section
      id="categories"
      className="relative overflow-hidden py-20 transition-colors duration-300 sm:py-24"
    >
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80    " />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80   " />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.25em] text-orange-500">
            Explore Collections
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight text-white dark:text-white sm:text-4xl">
            How It <span className="text-orange-500">Works</span>
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/70 dark:text-stone-400 sm:text-base">
            Browse our wide range of categories and discover something you'll
            love.
          </p>

          <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-linear-to-r from-orange-700 to-orange-400" />
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <motion.div
                key={category.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                }}
              >
                <div className="group relative flex min-h-47 max-w-100 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-gray-200/20 to-orange-600/10 p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 dark:border-white/8 dark:from-[#1c1916] dark:to-[#11100e] dark:hover:border-orange-500/40 dark:hover:shadow-orange-950/20">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/0 blur-[60px] transition-all duration-500 group-hover:bg-orange-500/10 dark:group-hover:bg-orange-500/15" />

                  <div className="relative flex items-start justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 transition-all duration-300 group-hover:border-orange-300 group-hover:bg-orange-100 group-hover:shadow-lg group-hover:shadow-orange-500/10 dark:border-orange-500/20 dark:bg-orange-500/10 dark:group-hover:border-orange-500/40 dark:group-hover:bg-orange-500/20 dark:group-hover:shadow-orange-500/10">
                      <Icon
                        size={26}
                        strokeWidth={1.7}
                        className="text-orange-500 transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  <div className="relative mt-7 text-center">
                    <h3 className="text-lg font-bold text-white transition-colors group-hover:text-orange-500 dark:text-stone-100 dark:group-hover:text-orange-400">
                      {category.name}
                    </h3>

                    <p className="mt-2 text-sm text-white/70 dark:text-stone-500">
                      {category.description}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 h-.5 w-0 bg-linear-to-r from-orange-600 to-amber-400 transition-all duration-500 group-hover:w-full" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Work;
