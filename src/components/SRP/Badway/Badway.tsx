import { useQuery } from "@tanstack/react-query";

export default function ProductPage() {
  const {
    data: products,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon");
      return await response.json();
    },
  });

  return (
    <div>
      <h1>Products Page</h1>
      {isFetching && <p>Loading...</p>}
      {error && <p>Something went wrong...</p>}
      {products && (
        <>
          {products.results.map((product) => (
            <div key={product.name}>{product.name}</div>
          ))}
        </>
      )}
    </div>
  );
}
