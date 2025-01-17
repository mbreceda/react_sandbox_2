import { useState, useMemo } from "react";

const initialItems = new Array(29_999_999)
  .fill(0)
  .map((_, i) => ({ id: i, isSelected: i === 29_999_999 }));

export default function BasicUseMemo() {
  const [count, setCount] = useState(0);
  const [items] = useState(initialItems);

  // Here is a performance optimization
  // It recomputes each time the count changes and the component re-renders

  // const selectedItem = items.find((item) => item.isSelected);

  // We only want to compute at least once
  // Items is always the same
  // It only has to recompute when items changes
  const selectedItem = useMemo(() => {
    const item = items.find((item) => item.isSelected);
    console.log(`Selected Item ${item?.isSelected}`);
    return item;
  }, [items]);

  const selectedCount = useMemo(() => {
    const item = items.find((item) => item.id == count);
    console.log(`Current Item ${item.id}`);
    return item;
  }, [items, count]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Current Count: {count}</h1>
      <h1 className="text-2xl font-bold mb-2">
        Selected Item: {selectedItem?.id}
      </h1>
      <h1 className="text-2xl font-bold mb-4">
        Selected Count: {selectedCount?.id}
      </h1>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
}
