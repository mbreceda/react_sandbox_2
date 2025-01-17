import { useRef, useState } from "react";

const BasicUseRef = () => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  const handleIncrement = () => {
    // This is trigger only on the re-render
    setCount(count + 1);
    console.log("State:", count);

    // Ref won't cause the compoment to re-render
    countRef.current++;
    console.log("Ref:", countRef.current);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Current Count: {count}</h1>
      <h2 className="text-xl mb-4">Ref Count: {countRef.current}</h2>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        onClick={handleIncrement}
      >
        Increment
      </button>
    </div>
  );
};

export default BasicUseRef;
