import { useReducer } from "react";
import BasicUseState from "./hooks/useState";
import BasicUseEffect from "./hooks/useEffect";
import BasicUseMemo from "./hooks/useMemo";
import BasicUseCallback from "./hooks/useCallback";
import BasicUseReducer from "./hooks/useReducer";
import BasicUseContext from "./hooks/useContext";
import BasicUseRef from "./hooks/useRef";
import BasicUseRefInput from "./hooks/useRefFocus";
import BasicUserRefScroll from "./hooks/useRefScroll";
interface State {
  index: number;
  totalTabs: number;
  error: string | null;
}

interface Action {
  type: "increment" | "decrement" | "reset";
}

const reducer = (state: State, action: Action) => {
  const { type } = action;
  switch (type) {
    case "increment": {
      const newCount = state.index + 1;
      const hasError = newCount > state.totalTabs;
      return {
        ...state,
        index: hasError ? state.index : newCount,
        error: hasError ? `Can't go over ${state.totalTabs}` : null,
      };
    }
    case "decrement": {
      const newCount = state.index - 1;
      const hasError = newCount < 0;
      return {
        ...state,
        index: hasError ? state.index : newCount,
        error: hasError ? "Can't go under 0" : null,
      };
    }
    case "reset": {
      return {
        ...state,
        index: 0,
        error: null,
      };
    }
    default:
      return state;
  }
};

const tabs = [
  { title: "UseState", content: <BasicUseState /> },
  { title: "UseEffect", content: <BasicUseEffect /> },
  { title: "UseMemo", content: <BasicUseMemo /> },
  { title: "UseCallback", content: <BasicUseCallback /> },
  { title: "UseReducer", content: <BasicUseReducer /> },
  { title: "UseReducer", content: <BasicUseReducer /> },
  { title: "UseContext", content: <BasicUseContext /> },
  { title: "UseRef", content: <BasicUseRef /> },
  { title: "UseRef - Input", content: <BasicUseRefInput /> },
  { title: "UseRef - Scroll", content: <BasicUserRefScroll /> },
];

function App() {
  const tabsLength = tabs.length - 1;
  const [state, dispatch] = useReducer(reducer, {
    index: 0,
    totalTabs: tabsLength,
    error: null,
  });
  console.log(tabs.length, tabsLength, state.index);
  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        <nav className="w-full p-4">
          <div className="container mx-auto flex justify-center items-center">
            <div className="space-x-4">
              <button
                className="px-4 py-2 text-white bg-green-500 hover:bg-green-700 rounded"
                onClick={() => dispatch({ type: "reset" })}
              >
                Home
              </button>
              <button
                disabled={state.index === 0}
                className={`px-4 py-2 text-white rounded ${
                  state.index === 0
                    ? "bg-gray-300"
                    : "bg-green-500 hover:bg-green-700"
                }`}
                onClick={() => dispatch({ type: "decrement" })}
              >
                Previous
              </button>
              <button
                disabled={state.index === tabsLength}
                className={`px-4 py-2 text-white rounded ${
                  state.index === tabsLength
                    ? "bg-gray-300"
                    : "bg-green-500 hover:bg-green-700"
                }`}
                onClick={() => dispatch({ type: "increment" })}
              >
                Next
              </button>
            </div>
          </div>
        </nav>
        {state.error && <div className="text-red-500 mt-4">{state.error}</div>}
      </div>
      <div className="container mx-auto p-4 ">
        <h1 className="text-4xl font-bold mb-3">{tabs[state.index].title}</h1>
        <div className="bg-white shadow-md rounded-md p-4 overflow-auto h-[70vh]">
          <div className="mt-2">{tabs[state.index].content}</div>
        </div>
      </div>
    </>
  );
}

export default App;
