interface Product {
  url: string;
  name: string;
}

type ProductListProps = {
  products: {
    results: Product[];
  };
};

function ProductCard({ product }: { product: Product }) {
  return (
    <div
      key={product.name}
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        margin: "10px",
        borderRadius: "5px",
      }}
    >
      <h2>{product.name}</h2>
      <p>{product.url}</p>
    </div>
  );
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {products?.results?.map((product) => (
        <ProductCard key={product.name} product={product} />
      ))}
    </div>
  );
}
