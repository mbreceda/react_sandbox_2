import { useState } from "react";

export default function BasicUseState() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-bold">Current Count: {count}</h1>
      <div className="space-x-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          onClick={() => setCount(count - 1)}
        >
          Decrement
        </button>
      </div>
    </div>
  );
}
