import {
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetAllProductsQuery,
  useSearchProductsQuery,
} from "../../redux/features/products/productsApiSlice";
import { wishlistApiSlice } from "../../redux/features/wishlists/wishlistApiSlice";
import FilterSidebar from "./FilterSidebar";
import ProductCard from "./ProductCard";

const ITEMS_PER_PAGE = 9;
const SHOP_SKELETON_KEYS = [
  "shop-skeleton-1",
  "shop-skeleton-2",
  "shop-skeleton-3",
  "shop-skeleton-4",
  "shop-skeleton-5",
  "shop-skeleton-6",
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const urlSearch = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const page = Number(searchParams.get("page") ?? 1);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);

  useEffect(() => setSearchInput(urlSearch), [urlSearch]);
  useEffect(() => setMinInput(minPrice), [minPrice]);
  useEffect(() => setMaxInput(maxPrice), [maxPrice]);

  const showToast = (message, type = "error") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const updateParam = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
          if (key !== "page") next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.trim() !== urlSearch) {
        updateParam("search", searchInput.trim());
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, urlSearch, updateParam]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (minInput !== minPrice) updateParam("minPrice", minInput);
    }, 450);
    return () => clearTimeout(t);
  }, [minInput, minPrice, updateParam]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (maxInput !== maxPrice) updateParam("maxPrice", maxInput);
    }, 450);
    return () => clearTimeout(t);
  }, [maxInput, maxPrice, updateParam]);

  const backendSort = sort && sort !== "newest" ? sort : undefined;

  const queryParams = useMemo(() => {
    const p = { page, limit: ITEMS_PER_PAGE };
    if (urlSearch) p.search = urlSearch;
    if (category) p.category = category;
    if (minPrice) p.minPrice = Number(minPrice);
    if (maxPrice) p.maxPrice = Number(maxPrice);
    if (backendSort) p.sort = backendSort;
    return p;
  }, [page, urlSearch, category, minPrice, maxPrice, backendSort]);

  const isSearching = Boolean(urlSearch);

  const allProductsQuery = useGetAllProductsQuery(queryParams, {
    skip: isSearching,
  });

  const searchProductsQuery = useSearchProductsQuery(
    { ...queryParams, q: urlSearch, keyword: urlSearch },
    { skip: !isSearching },
  );

  const { data, isLoading, isFetching, isError, refetch } = isSearching
    ? searchProductsQuery
    : allProductsQuery;

  const { data: wishlistData } =
    wishlistApiSlice.endpoints.getMyWishlist.useQuery();

  const wishlistIds = useMemo(() => {
    const raw =
      wishlistData?.wishlist?.products ??
      wishlistData?.data?.wishlist?.products ??
      wishlistData?.data?.products ??
      wishlistData?.products ??
      wishlistData?.data?.items ??
      wishlistData?.items ??
      [];
    if (!Array.isArray(raw)) return new Set();
    return new Set(
      raw
        .map((item) =>
          typeof item === "string"
            ? item
            : (item?._id ?? item?.id ?? item?.product?._id ?? item?.productId),
        )
        .filter(Boolean),
    );
  }, [wishlistData]);

  const rawProducts = data?.products ?? data?.data?.products ?? [];

  const products = useMemo(() => {
    if (sort !== "newest") return rawProducts;
    return [...rawProducts].sort((a, b) => {
      const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [rawProducts, sort]);

  const totalPages = data?.totalPages ?? data?.data?.totalPages ?? 1;
  const totalProducts =
    data?.totalProducts ?? data?.data?.totalProducts ?? products.length;

  const hasActiveFilters = Boolean(
    urlSearch || category || minPrice || maxPrice || sort,
  );

  const handleClearFilters = () => {
    setSearchInput("");
    setMinInput("");
    setMaxInput("");
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Header Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/65 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/45 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products by name, brand, or keyword..."
            className="w-full rounded-xl border border-slate-200/80 bg-white/80 py-2.5 pl-10 pr-9 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-400"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isLoading ? "Loading..." : `${totalProducts} Products`}
          </span>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-800 transition hover:border-orange-500 dark:border-white/10 dark:bg-white/5 dark:text-white lg:hidden"
          >
            <SlidersHorizontal size={15} className="text-orange-500" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div
          className={`${
            mobileFiltersOpen ? "block" : "hidden"
          } lg:col-span-3 lg:block`}
        >
          <div className="lg:sticky lg:top-24">
            <FilterSidebar
              category={category}
              minPrice={minInput}
              maxPrice={maxInput}
              sort={sort}
              onCategoryChange={(val) => updateParam("category", val)}
              onMinPriceChange={setMinInput}
              onMaxPriceChange={setMaxInput}
              onSortChange={(val) => updateParam("sort", val)}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </div>

        <div className="lg:col-span-9">
          {isError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-white/65 p-12 text-center backdrop-blur-xl dark:bg-black/45">
              <p className="mb-3 text-sm font-bold text-red-500">
                Failed to load products. Please try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/30 hover:bg-orange-600"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {SHOP_SKELETON_KEYS.map((skeletonKey) => (
                <div
                  key={skeletonKey}
                  className="animate-pulse rounded-2xl border border-slate-200/70 bg-white/50 p-3.5 backdrop-blur-xl dark:border-white/10 dark:bg-black/40"
                >
                  <div className="mb-3 aspect-square w-full rounded-xl bg-slate-200/70 dark:bg-white/10" />
                  <div className="mb-2 h-4 w-3/4 rounded bg-slate-200/70 dark:bg-white/10" />
                  <div className="mb-4 h-3 w-1/3 rounded bg-slate-200/70 dark:bg-white/10" />
                  <div className="h-9 w-full rounded-xl bg-slate-200/70 dark:bg-white/10" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white/65 px-6 py-16 text-center backdrop-blur-xl dark:border-white/10 dark:bg-black/45">
              <PackageSearch size={44} className="mb-3 text-orange-500/80" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                No products match your filters
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Try adjusting your search keywords, price range, or category
                filters to find what you're looking for.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-5 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div
                className={`grid grid-cols-1 gap-5 transition-opacity duration-200 sm:grid-cols-2 xl:grid-cols-3 ${
                  isFetching ? "opacity-60" : "opacity-100"
                }`}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product._id ?? product.id}
                    product={product}
                    isWishlisted={wishlistIds.has(product._id ?? product.id)}
                    onToast={showToast}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => updateParam("page", String(page - 1))}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-700 backdrop-blur-md transition hover:border-orange-500 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-black/50 dark:text-slate-200"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pNum = idx + 1;
                    const active = pNum === page;
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => updateParam("page", String(pNum))}
                        className={`h-9 min-w-9 rounded-xl px-3 text-xs font-bold transition-all ${
                          active
                            ? "bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30"
                            : "border border-slate-200/80 bg-white/70 text-slate-700 backdrop-blur-md hover:border-orange-500 hover:text-orange-500 dark:border-white/10 dark:bg-black/50 dark:text-slate-200"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => updateParam("page", String(page + 1))}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-700 backdrop-blur-md transition hover:border-orange-500 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-black/50 dark:text-slate-200"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
