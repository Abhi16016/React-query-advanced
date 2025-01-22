import axios from "axios";
import debounce from "lodash.debounce";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type ProductList = {
  id: number;
  title: string;
  thumbnail: string;
  price: number;
  category: string;
  rating: number;
};

type ProductsResData = {
  products: ProductList[];
  total: number;
};

type Category = {
  slug: string;
  name: string;
  url: string;
};

async function fetchCategories(): Promise<Category[]> {
  const response = await axios.get<Category[]>("https://dummyjson.com/products/categories");
  return response.data;
}

async function fetchProducts(skip: number, limit: number, q: string, category: string): Promise<ProductsResData> {
  let url = `https://dummyjson.com/products/search?limit=${limit}&skip=${skip}&q=${q}`;
  if (category) {
    url = `https://dummyjson.com/products/category/${category}?limit=${limit}&skip=${skip}`;
  }
  try {
    const response = await axios.get<ProductsResData>(url);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch data")
  }

}

function Products() {
  const [searchParams, setSearchParams] = useSearchParams({ skip: "0", limit: "4" });
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "4", 10);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const { isLoading, error, data: productsData } = useQuery<ProductsResData>({
    queryKey: ["products", skip, limit, q, category],
    queryFn: () => fetchProducts(skip, limit, q, category),
    placeholderData: keepPreviousData,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    placeholderData: keepPreviousData,
  });

  if (isLoading && !productsData) {
    return <h3>Loading...</h3>;
  }

  if (error instanceof Error) {
    return <h3>Error: {error.message}</h3>;
  }

  const handleMove = (moveCount: number) => {
    setSearchParams((prev) => {
      const newSkip = Math.max(skip + moveCount, 0);
      prev.set("skip", newSkip.toString());
      return prev;
    });
  };

  const handleCategorySelect = (slug: string) => {
    setSearchParams((prev) => {
      prev.set("skip", "0");
      prev.delete("q");
      prev.set("category", slug);
      return prev;
    });
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Store</h2>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            onChange={debounce((e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchParams((prev) => {
                prev.set("q", e.target.value);
                prev.set("skip", "0");
                prev.delete("category");
                return prev;
              });
            }, 1000)}
            type="text"
            placeholder="Search products..."
            value={q}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {category ? `Category: ${category}` : "All Categories"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCategorySelect("")}>
                All Categories
              </DropdownMenuItem>
              {categories?.map((cat) => (
                <DropdownMenuItem
                  key={cat.slug}
                  onClick={() => handleCategorySelect(cat.slug)}
                >
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {productsData?.products?.length ? (
            productsData.products.map((product) => (
              <Link to={`/products/${product.id}`} key={product.id}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{product.title}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img
                      alt={product.title}
                      src={product.thumbnail}
                      className="aspect-square w-full rounded-md bg-gray-200 object-cover"
                    />
                  </CardContent>
                  <CardFooter>
                    <div>
                      <p className="text-sm text-gray-900 font-bold">${product.price}</p>
                      <p className="text-sm text-yellow-500 font-medium">⭐️ {product.rating}</p>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button disabled={skip === 0} onClick={() => handleMove(-limit)}>
            Prev
          </Button>
          <Button
            disabled={skip + limit >= (productsData?.total || 0)}
            onClick={() => handleMove(limit)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Products;
