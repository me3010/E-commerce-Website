import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Dumbbell,
  Gamepad2,
  Headphones,
  Heart,
  House,
  Laptop,
  Package,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sofa,
  Sparkles,
  Watch,
} from "lucide-react";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { useGetAllProductsQuery } from "../../redux/features/products/productsApiSlice";

const getCategoryIcon = (categoryName = "") => {
  const name = categoryName.toLowerCase().trim();

  if (
    name.includes("electronic") ||
    name.includes("computer") ||
    name.includes("laptop")
  )
    return Laptop;

  if (name.includes("phone") || name.includes("mobile")) return Smartphone;

  if (name.includes("Home") || name.includes("house")) return House;

  if (name.includes("Fashion") || name.includes("cloth")) return Shirt;

  if (name.includes("Headphone") || name.includes("audio")) return Headphones;

  if (name.includes("Watch")) return Watch;

  if (name.includes("beauty") || name.includes("cosmetic")) return Sparkles;

  if (name.includes("sport") || name.includes("fitness")) return Dumbbell;

  if (name.includes("furniture") || name.includes("sofa")) return Sofa;

  if (name.includes("game")) return Gamepad2;

  if (name.includes("book")) return BookOpen;

  if (name.includes("camera") || name.includes("photo")) return Camera;

  if (name.includes("health")) return Heart;

  return ShoppingBag;
};

const createSlug = (value = "") => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const extractProducts = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.products)) {
    return response.data.products;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.result?.products)) {
    return response.result.products;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

const getProductCategory = (product) => {
  const category = product?.category;

  if (typeof category === "string") {
    return {
      name: category,
      slug: createSlug(category),
    };
  }

  if (category && typeof category === "object") {
    const name =
      category.name || category.title || category.categoryName || category.slug;

    if (!name) return null;

    return {
      name,
      slug: category.slug || createSlug(name),
    };
  }

  if (product?.categoryName) {
    return {
      name: product.categoryName,
      slug: product.categorySlug || createSlug(product.categoryName),
    };
  }

  return null;
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function Category() {
  const { data, isLoading, isFetching, isError } = useGetAllProductsQuery({
    limit: 30,
  });

  const categories = useMemo(() => {
    const products = extractProducts(data);

    const categoryMap = new Map();

    for (const product of products) {
      const category = getProductCategory(product);

      if (!category?.name) continue;

      const categoryKey = category.slug || createSlug(category.name);

      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, {
          name: category.name,
          slug: category.slug || categoryKey,
          count: 0,
        });
      }

      categoryMap.get(categoryKey).count += 1;
    }

    return Array.from(categoryMap.values()).slice(0, 3);
  }, [data]);

  return (
    <section
      id="categories"
      className="relative overflow-hidden py-20 transition-colors duration-300 sm:py-24"
    >
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full   " />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full   " />

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

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Shop by <span className="text-orange-500">Category</span>
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/60 dark:text-stone-400 sm:text-base">
            Browse our wide range of categories and discover something you'll
            love.
          </p>

          <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-linear-to-r from-orange-700 to-orange-400" />
        </motion.div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="min-h-47 animate-pulse rounded-2xl border border-white/10 bg-white/5 p-7"
              >
                <div className="h-14 w-14 rounded-2xl bg-white/10" />

                <div className="mt-7 h-5 w-32 rounded bg-white/10" />

                <div className="mt-3 h-4 w-24 rounded bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="py-10 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-orange-500" />

            <p className="text-sm text-white/70 dark:text-stone-400">
              Unable to load categories right now.
            </p>
          </div>
        )}

        {!isLoading && !isError && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = getCategoryIcon(category.name);

              return (
                <motion.div
                  key={category.slug}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.12,
                  }}
                >
                  <Link
                    to={`/shop?category=${category.slug}`}
                    className="group relative flex min-h-47 max-w-100 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-gray-200/20 to-orange-600/10 p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 dark:border-white/8 dark:from-[#1c1916] dark:to-[#11100e] dark:hover:border-orange-500/40 dark:hover:shadow-orange-950/20"
                  >
                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/0 blur-[60px] transition-all duration-500 group-hover:bg-orange-500/10 dark:group-hover:bg-orange-500/15" />

                    <div className="relative flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 transition-all duration-300 group-hover:border-orange-300 group-hover:bg-orange-100 group-hover:shadow-lg group-hover:shadow-orange-500/10 dark:border-orange-500/20 dark:bg-orange-500/10 dark:group-hover:border-orange-500/40 dark:group-hover:bg-orange-500/20 dark:group-hover:shadow-orange-500/10">
                        <Icon
                          size={26}
                          strokeWidth={1.7}
                          className="text-orange-500 transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>

                      <ArrowRight
                        size={20}
                        className="text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange-500 dark:text-stone-600 dark:group-hover:text-orange-500"
                      />
                    </div>

                    <div className="relative mt-7">
                      <h3 className="text-lg font-bold text-white transition-colors group-hover:text-orange-500 dark:text-stone-100 dark:group-hover:text-orange-400">
                        {category.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-semibold text-orange-500">
                          {category.count}
                        </span>

                        <span className="text-sm text-white/70 dark:text-stone-500">
                          {category.count === 1 ? "Product" : "Products"}
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 h-.5 w-0 bg-linear-to-r from-orange-600 to-amber-400 transition-all duration-500 group-hover:w-full" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && !isError && categories.length === 0 && (
          <div className="py-10 text-center">
            <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-orange-500" />

            <p className="text-sm text-white/70 dark:text-stone-400">
              No categories found.
            </p>
          </div>
        )}

        {isFetching && !isLoading && (
          <p className="mt-4 text-center text-xs text-orange-500">
            Updating categories...
          </p>
        )}
      </div>
    </section>
  );
}

export default Category;
