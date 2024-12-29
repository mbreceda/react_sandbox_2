import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as { statusText?: string; message?: string };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Oops!</h1>
      <p className="text-lg mb-2">Sorry, an unexpected error has occurred.</p>
      <p className="text-sm text-gray-500">
        <i>{error?.statusText || error.message}</i>
      </p>
    </div>
  );
}
