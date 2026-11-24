import { Check, ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Electronics", value: "electronics" },
  { label: "Fashion", value: "fashion" },
  { label: "Phones", value: "phones" },
  { label: "Accessories", value: "accessories" },
];

const SORT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];

export default function FilterSidebar({
  category,
  minPrice,
  maxPrice,
  sort,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const selectedSort =
    SORT_OPTIONS.find((opt) => opt.value === sort) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <aside className="rounded-2xl border border-orange-500/20 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-orange-400/20 dark:bg-white/10">
      <div className="mb-5 flex items-center justify-between border-b border-orange-500/15 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={17} className="text-orange-500" />
          <h2 className="text-sm font-extrabold tracking-wide text-orange-600 dark:text-orange-400">
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <span className="h-2 w-2 rounded-full bg-orange-500" />
        )}
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-500/90 dark:text-orange-300">
          Category
        </h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => {
            const active = category.toLowerCase() === cat.value.toLowerCase();
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => onCategoryChange(cat.value)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-sm transition-all ${
                  active
                    ? "bg-orange-500 font-bold text-white shadow-sm shadow-orange-500/25"
                    : "bg-white/60 font-medium text-orange-700 hover:bg-orange-500/15 hover:text-orange-600 dark:bg-white/5 dark:text-orange-200 dark:hover:bg-orange-500/20"
                }`}
              >
                <span
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors ${
                    active
                      ? "border-white bg-white"
                      : "border-orange-400/70 bg-white/90"
                  }`}
                >
                  {active && (
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                  )}
                </span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-500/90 dark:text-orange-300">
          Price Range (EGP)
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full rounded-xl border border-orange-500/25 bg-white/85 px-3 py-2.5 text-xs font-semibold text-orange-700 placeholder:text-orange-400/70 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 dark:bg-white/10 dark:text-orange-200 dark:placeholder:text-orange-300/60"
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full rounded-xl border border-orange-500/25 bg-white/85 px-3 py-2.5 text-xs font-semibold text-orange-700 placeholder:text-orange-400/70 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 dark:bg-white/10 dark:text-orange-200 dark:placeholder:text-orange-300/60"
          />
        </div>
      </div>

      <div ref={sortRef} className="relative mb-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-500/90 dark:text-orange-300">
          Sort By
        </h3>

        <button
          type="button"
          aria-expanded={sortOpen}
          onClick={() => setSortOpen((prev) => !prev)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-orange-500/35 bg-white/85 px-3.5 py-2.5 text-xs font-bold text-orange-600 shadow-xs transition hover:border-orange-500 hover:bg-orange-50/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:bg-white/10 dark:text-orange-300"
        >
          <span>{selectedSort.label}</span>
          <ChevronDown
            size={16}
            className={`text-orange-500 transition-transform duration-200 ${
              sortOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {sortOpen && (
          <ul className="mt-2 space-y-1 rounded-xl border border-orange-500/30 bg-white/95 p-1.5 shadow-lg shadow-orange-500/10 backdrop-blur-xl dark:bg-orange-950/90">
            {SORT_OPTIONS.map((opt) => {
              const active = sort === opt.value;
              return (
                <li key={opt.label}>
                  <button
                    type="button"
                    onClick={() => {
                      onSortChange(opt.value);
                      setSortOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition-colors ${
                      active
                        ? "bg-orange-500 text-white"
                        : "bg-white/70 text-orange-700 hover:bg-orange-500/15 hover:text-orange-600 dark:bg-white/5 dark:text-orange-200 dark:hover:bg-orange-500/20"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {active && <Check size={14} className="text-white" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={onClearFilters}
        disabled={!hasActiveFilters}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
          hasActiveFilters
            ? "cursor-pointer border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/25 hover:bg-orange-600"
            : "cursor-not-allowed border-orange-500/25 bg-white/75 text-orange-500/60 dark:bg-white/10 dark:text-orange-300/50"
        }`}
      >
        <RotateCcw size={14} />
        Clear All Filters
      </button>
    </aside>
  );
}
