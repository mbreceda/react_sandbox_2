import { useEffect } from "react";
import { useLoaderData, useSubmit, useNavigation } from "react-router-dom";

function Spinner() {
  return (
    <svg
      className="h-5 w-5 text-gray-500 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

function Search() {
  const { q } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();

  const searching =
    navigation.location &&
    navigation.location.search &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const input = document.getElementById("q") as HTMLInputElement;
    if (input) {
      input.value = q;
    }
  }, [q]);

  return (
    <form id="search-form" role="search">
      <input
        id="q"
        name="q"
        type="search"
        placeholder="Search"
        className="search-input p-2 border rounded-md shadow-sm "
        style={{ outline: "none" }}
        defaultValue={q}
        onChange={(e) => {
          const isFirstSearch = q == null;
          submit(e.currentTarget.form, {
            replace: !isFirstSearch,
          });
        }}
      />
      <div id="search-spinner" aria-hidden hidden={!searching}>
        <Spinner />
      </div>
      <div className="sr-only" aria-live="polite"></div>
    </form>
  );
}

export default Search;
