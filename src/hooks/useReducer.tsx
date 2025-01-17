import { useReducer } from "react";

// STATE
interface State {
  count: number;
  error: string | null;
}

interface Action {
  type: "increment" | "decrement";
}

function reducer(state: State, action: Action) {
  const { type } = action;
  switch (type) {
    case "increment": {
      const newCount = state.count + 1;
      const hasError = newCount > 5;
      return {
        ...state,
        count: hasError ? state.count : newCount,
        error: hasError ? "Can't go over 5" : null,
      };
    }
    case "decrement": {
      const newCount = state.count - 1;
      const hasError = newCount < 0;
      return {
        ...state,
        count: hasError ? state.count : newCount,
        error: hasError ? "Can't go under 0" : null,
      };
    }
    default:
      return state;
  }
}

export default function BasicUseReducer() {
  const [state, dispatch] = useReducer(reducer, { count: 0, error: null });

  return (
    <div className="flex flex-col items-center space-y-4 m-10">
      <div className="text-xl font-bold">Count: {state.count}</div>
      {state.error && <div className="text-red-500">{state.error}</div>}
      <div className="space-x-2">
        <button
          disabled={state.count === 5}
          className={`px-4 py-2 text-white rounded ${
            state.count === 5 ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-700"
          }`}
          onClick={() => dispatch({ type: "increment" })}
        >
          Increment
        </button>
        <button
          disabled={state.count === 0}
          className={`px-4 py-2 text-white rounded ${
            state.count === 0 ? "bg-red-300" : "bg-red-500 hover:bg-red-700"
          }`}
          onClick={() => dispatch({ type: "decrement" })}
        >
          Decrement
        </button>
      </div>
    </div>
  );
}
