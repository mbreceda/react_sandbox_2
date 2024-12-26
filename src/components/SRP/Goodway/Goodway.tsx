import { useFetchProducts } from "./hooks/useFetchProducts";
import LoadingDisplay from "./components/LoadingDisplay";
import ErrorDisplay from "./components/ErrorDisplay";
import ProductList from "./components/ProductList";

export default function ProductPage() {
  const { data: products, isFetching, error } = useFetchProducts();
  console.log(products);

  return (
    <>
      <h1>Products Page</h1>
      <div style={{ height: "100vh" }}>
        {isFetching && <LoadingDisplay />}
        {error && <ErrorDisplay />}
        {products && <ProductList products={products} />}
      </div>
    </>
  );
}
