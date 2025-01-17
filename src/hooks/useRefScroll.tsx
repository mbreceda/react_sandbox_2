import { useRef } from "react";

function BasicUserRefScroll() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5">
      <div
        className="h-screen flex bg-white shadow-md rounded-lg p-4 w-5/6"
        ref={scrollRef}
      >
        <p className="text-lg font-semibold">Scroll down</p>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={handleScroll}
      >
        Scroll To Top
      </button>
    </div>
  );
}

export default BasicUserRefScroll;
