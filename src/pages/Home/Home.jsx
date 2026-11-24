import Cards from "../../components/homeSections/Cards";
import Category from "../../components/homeSections/Category";
import Hero from "../../components/homeSections/Hero";
import Newsletter from "../../components/homeSections/NewsLetter";
import Work from "../../components/homeSections/Work";
import { useGetAllProductsQuery } from "../../redux/features/products/productsApiSlice";

export default function Home() {
  const {
    data: productsResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetAllProductsQuery({ limit: 8 });

  const allProducts =
    productsResponse?.data?.products ||
    productsResponse?.products ||
    productsResponse?.data ||
    productsResponse?.results ||
    [];

  const featuredProducts = Array.isArray(allProducts)
    ? allProducts.filter((product) => product.isActive !== false).slice(0, 8)
    : [];
  return (
    <div className="min-h-screen overflow-hidden    transition-colors duration-300    ">
      {/* ================= HERO SECTION ================= */}

      <Hero />

      {/* ================= CATEGORIES SECTION ================= */}

      <Category />
      <Cards
        products={featuredProducts}
        isLoading={isLoading || isFetching}
        isError={isError}
      />
      <Work />
      <Newsletter />
    </div>
  );
}
