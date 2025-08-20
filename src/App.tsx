import { useReducer } from "react";
import { initialScaleState, scaleReducer } from "./hooks/scaleReducer";
import Input from "./components/Input";
import ScaleDisplay from "./components/ScaleDisplay";
import ToleranceDisplay from "./components/ToleranceDisplay";

import "./App.css";

function App() {
  const [state, dispatch] = useReducer(scaleReducer, initialScaleState);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id: name } = e.target;
    const numValue = Number(value);

    const axis = name[0] as "x" | "y" | "z";

    if (name.endsWith("model")) {
      dispatch({ type: "SET_MODEL", axis, value: numValue });
    } else if (name.endsWith("printed")) {
      dispatch({ type: "SET_PRINTED", axis, value: numValue });
    } else if (name.endsWith("increase")) {
      dispatch({ type: "SET_INCREASE", axis, value: numValue });
    } else if (name.endsWith("reduce")) {
      dispatch({ type: "SET_DECREASE", axis, value: numValue });
    }
  };

  return (
    <div className="container flex flex-col justify-center h-screen p-6">
      <section>
        <h1 className="text-4xl font-bold text-center mb-10">
          Scale Conversion Calculator
        </h1>
        <div className="my-6 w-full">
          <div className="w-full flex flex-row gap-2">
            <div className="flex flex-col gap-2 items-center mr-2">
              <h2 className="text-2xl font-bold ml-4">Model Size (MM)</h2>
              <Input
                label="X"
                name="x-model"
                onChange={onChange}
                tabIndex={1}
              />
              <Input
                label="Y"
                name="y-model"
                onChange={onChange}
                tabIndex={4}
              />
              <Input
                label="Z"
                name="z-model"
                onChange={onChange}
                tabIndex={7}
              />
            </div>
            <div className="flex flex-col gap-2 items-center mr-2">
              <h2 className="text-2xl font-bold">Printed Size (MM)</h2>
              <Input
                label="X"
                name="x-printed"
                showLabel={false}
                onChange={onChange}
                tabIndex={2}
              />
              <Input
                label="Y"
                name="y-printed"
                showLabel={false}
                onChange={onChange}
                tabIndex={5}
              />
              <Input
                label="Z"
                name="z-printed"
                showLabel={false}
                onChange={onChange}
                tabIndex={8}
              />
            </div>
            <div className="flex flex-col gap-2 items-center">
              <h2 className="text-2xl font-bold">Scale to This</h2>
              <div className="flex flex-col gap-2 w-full items-center">
                <ScaleDisplay scale={state.xScale} />
                <ScaleDisplay scale={state.yScale} />
                <ScaleDisplay scale={state.zScale} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h1 className="text-2xl my-4">Add or Reduce Tolerance X</h1>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <Input
              label="Reduce Tolerance"
              name="x-reduce"
              onChange={onChange}
            />
            <Input
              label="Increase Tolerance"
              name="x-increase"
              onChange={onChange}
            />
          </div>
          <ToleranceDisplay tolerance={state.xTolerance} />
        </div>
      </section>
      <section>
        <h1 className="text-2xl my-4">Add or Reduce Tolerance Y</h1>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <Input
              label="Reduce Tolerance"
              name="y-reduce"
              onChange={onChange}
            />
            <Input
              label="Increase Tolerance"
              name="y-increase"
              onChange={onChange}
            />
          </div>
          <ToleranceDisplay tolerance={state.yTolerance} />
        </div>
      </section>
      <section>
        <h1 className="text-2xl my-4">Add or Reduce Tolerance Z</h1>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <Input
              label="Reduce Tolerance"
              name="z-reduce"
              onChange={onChange}
            />
            <Input
              label="Increase Tolerance"
              name="z-increase"
              onChange={onChange}
            />
          </div>
          <ToleranceDisplay tolerance={state.zTolerance} />
        </div>
      </section>
    </div>
  );
}

export default App;
