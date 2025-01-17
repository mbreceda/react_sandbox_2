import { useState, useEffect } from "react";

export default function BasicUseEffect() {
  const [count, setCount] = useState(0);

  // React to the count state
  // As side effect
  useEffect(() => {
    // The code that we want to run
    console.log("The count is now: ", count);

    // Optional return function
    return () => {
      console.log("I am being cleaned up");
    };
  }, [count]); // The dependency array

  // UseEffect re run everytime the count changes
  // Before it re runs, it excutes the clean up function
  // It can be use for unsubscribing, clearing intervals, etc.
  // It acts as componentDidMount, componentDidUpdate, and componentWillUnmount

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
