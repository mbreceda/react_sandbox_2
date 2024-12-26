import { useQuery } from "@tanstack/react-query";

const fetchProducts = async () => {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon");
  return await response.json();
};

export const useFetchProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
};
