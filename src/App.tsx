import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-4">
        Vite + React + Tailwind
      </h1>
      <div className="card p-4 mt-4 border rounded shadow-md text-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
        <p className="mt-2">
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs text-center mt-4">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
