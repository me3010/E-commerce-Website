import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import Cookies from "js-cookie";
import {
  Heart,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logoImage from "../../../assets/logo1.png";
import useTheme from "../../../hooks/useTheme";
import { apiSlice } from "../../../redux/app/api/apiSlice";
import { useLogoutMutation } from "../../../redux/features/auth/authApiSlice";
import { useGetMyCartQuery } from "../../../redux/features/carts/cartApiSlice";
import { useGetMyWishlistQuery } from "../../../redux/features/wishlists/wishlistApiSlice";
import SearchBox from "./SearchBox";

const links = [
  { to: "/home", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/orders", label: "My Orders" },
  { to: "/wishlist", label: "Wishlist" },
];

const iconBtn =
  "relative grid h-10 w-10 place-items-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 shadow-sm backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:text-orange-500 hover:shadow-md hover:shadow-orange-500/20 active:scale-90 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-orange-400";

const menuPanel = {
  closed: { height: 0, opacity: 0, transition: { duration: 0.2 } },
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.28,
      ease: "easeOut",
      delayChildren: 0.05,
      staggerChildren: 0.045,
    },
  },
};
const menuItem = {
  closed: { opacity: 0, x: -14 },
  open: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const cartCountOf = (res) => {
  if (!res) return 0;

  if (typeof res?.itemCount === "number") return res.itemCount;

  const items = (Array.isArray(res?.items) && res.items) || null;

  if (items) {
    return items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
  }

  return 0;
};

const wishlistCountOf = (res) => {
  if (!res) return 0;

  const products =
    (Array.isArray(res?.wishlist?.products) && res.wishlist.products) || null;

  if (products) {
    return products.length;
  }

  return 0;
};

const hasSession = () => {
  if (Cookies.get("token")) return true;
  try {
    return localStorage.getItem("isAuthenticated") === "true";
  } catch {
    return false;
  }
};

const readUserLabel = () => {
  const raw = Cookies.get("user");
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return parsed?.username || parsed?.name || raw;
  } catch {
    return raw;
  }
};

function Badge({ n }) {
  if (!n) return null;
  return (
    <motion.span
      key={n}
      initial={{ scale: 0.4 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 600, damping: 14 }}
      className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900"
    >
      {n > 99 ? "99+" : n}
    </motion.span>
  );
}

function DesktopLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
          isActive
            ? "text-white"
            : "text-slate-600 hover:text-orange-500 dark:text-slate-300 dark:hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-pill"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="absolute inset-0 rounded-full bg-linear-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/40 ring-1 ring-white/25 dark:ring-white/10"
            />
          )}
          <span className="relative z-10">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const headerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const [isAuthed, setIsAuthed] = useState(() => hasSession());
  const [userLabel, setUserLabel] = useState(() => readUserLabel());

  const syncAuth = useCallback(() => {
    setIsAuthed(hasSession());
    setUserLabel(readUserLabel());
  }, []);

  useEffect(() => {
    if (pathname) {
      syncAuth();
      setMenuOpen(false);
      setSearchOpen(false);
    }
  }, [pathname, syncAuth]);

  useEffect(() => {
    window.addEventListener("storage", syncAuth);
    window.addEventListener("authChange", syncAuth);
    window.addEventListener("focus", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("authChange", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, [syncAuth]);

  const { data: cart, refetch: refetchCart } = useGetMyCartQuery(undefined, {
    skip: !isAuthed,
    refetchOnMountOrArgChange: true,
  });
  const { data: wishlist, refetch: refetchWishlist } = useGetMyWishlistQuery(
    undefined,
    {
      skip: !isAuthed,
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (isAuthed) {
      refetchCart();
      refetchWishlist();
    }
  }, [isAuthed, refetchCart, refetchWishlist]);

  const cartCount = isAuthed ? cartCountOf(cart) : 0;
  const wishlistCount = isAuthed ? wishlistCountOf(wishlist) : 0;

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));
  useEffect(() => {
    setScrolled(window.scrollY > 12);
  }, []);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const close = () => {
      setMenuOpen(false);
      setSearchOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && close();
    const onPointer = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen, searchOpen]);

  const toggleSearch = () => {
    setMenuOpen(false);
    setSearchOpen((v) => !v);
  };
  const toggleMenu = () => {
    setSearchOpen(false);
    setMenuOpen((v) => !v);
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.log("Logout Error:", err);
    } finally {
      Cookies.remove("token", { path: "/" });
      Cookies.remove("user", { path: "/" });
      try {
        Cookies.remove("role", { path: "/" });

        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");
      } catch {}
      setIsAuthed(false);
      setUserLabel("");
      window.dispatchEvent(new Event("authChange"));
      dispatch(apiSlice.util.resetApiState());
      navigate("/login");
    }
  };

  const mobileLinks = [
    ...links.map((l) =>
      l.to === "/wishlist" ? { ...l, count: wishlistCount } : l,
    ),
    { to: "/cart", label: "Cart", count: cartCount },
  ];

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled
          ? "border-slate-200/80 bg-white/85 shadow-lg shadow-black/5 backdrop-saturate-150 dark:border-white/10 dark:bg-black/70"
          : "border-slate-200/60 bg-white/65 shadow-sm dark:border-white/10 dark:bg-black/50"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 transition-[padding] duration-300 sm:px-6 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        <Link
          to="/home"
          className="flex shrink-0 items-center transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <img
            src={logoImage}
            alt="Logo"
            className="h-20 w-40 rounded-full object-cover"
          />
        </Link>
        <nav
          aria-label="Main"
          className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/60 p-1.5 shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-white/5 md:flex"
        >
          {links.map((l) => (
            <DesktopLink key={l.to} {...l} />
          ))}
        </nav>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <SearchBox className="hidden w-44 lg:block xl:w-60" />

          <button
            type="button"
            aria-label={searchOpen ? "Close search" : "Search"}
            aria-expanded={searchOpen}
            onClick={toggleSearch}
            className={`${iconBtn} lg:hidden`}
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          <button
            type="button"
            aria-label={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
            onClick={toggleTheme}
            className={iconBtn}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? "sun" : "moon"}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="grid place-items-center"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>

          <Link
            to="/wishlist"
            aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
            className={`${iconBtn} hidden sm:grid`}
          >
            <Heart size={18} />
            <Badge n={wishlistCount} />
          </Link>
          <Link
            to="/cart"
            aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}
            className={`${iconBtn} hidden sm:grid`}
          >
            <ShoppingCart size={18} />
            <Badge n={cartCount} />
          </Link>

          {isAuthed ? (
            <>
              <Link
                to="/profile"
                aria-label="Profile"
                className="flex h-10 items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 text-slate-700 shadow-sm backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:text-orange-500 hover:shadow-md hover:shadow-orange-500/20 active:scale-90 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-orange-400"
              >
                <User size={18} className="shrink-0" />
                {userLabel && (
                  <span className="max-w-28 truncate text-sm font-semibold">
                    {userLabel}
                  </span>
                )}
              </Link>
              <button
                type="button"
                aria-label="Log out"
                disabled={isLoggingOut}
                onClick={logout}
                className={`${iconBtn} hidden hover:text-red-500! sm:grid disabled:opacity-50`}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-linear-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/35 transition duration-200 hover:-translate-y-0.5 hover:from-orange-400 hover:to-orange-500 hover:shadow-orange-500/50 active:scale-95"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={toggleMenu}
            className={`${iconBtn} md:hidden`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? "x" : "menu"}
                initial={{ rotate: -80, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 80, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid place-items-center"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
              <SearchBox autoFocus onDone={() => setSearchOpen(false)} />
            </div>
          </motion.div>
        )}

        {menuOpen && (
          <motion.nav
            key="menu"
            aria-label="Mobile"
            variants={menuPanel}
            initial="closed"
            animate="open"
            exit="closed"
            className="overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 pb-4">
              {mobileLinks.map((l) => (
                <motion.div key={l.to} variants={menuItem}>
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                      }`
                    }
                  >
                    {l.label}
                    {l.count ? (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-1 ring-white/60">
                        {l.count > 99 ? "99+" : l.count}
                      </span>
                    ) : null}
                  </NavLink>
                </motion.div>
              ))}
              {isAuthed && (
                <motion.div variants={menuItem}>
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={logout}
                    className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Log out
                  </button>
                </motion.div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-linear-to-r from-orange-400 to-orange-600"
      />
    </motion.header>
  );
}
