import { useState, useRef, useEffect } from "react";

function PreviousStateExample() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef<number | null>(null);
  // console.log("UseState");

  useEffect(() => {
    // Update the ref with the current count after each render
    prevCountRef.current = count;
  }, [count]);

  const handleIncrement = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <h1>Current Count: {count}</h1>
      <h2>Previous Count: {prevCountRef.current}</h2>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
}

export default PreviousStateExample;
