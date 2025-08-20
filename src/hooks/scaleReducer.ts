function getBaseScale(model: number, printed: number) {
  return model && printed ? truncate((model * 100) / printed) : 0;
}

function getTolerance(val: number, printed: number) {
  return printed ? truncate((val * 100) / printed) : 0;
}
// src/hooks/scaleReducer.ts

export type ScaleState = {
  xModel: number;
  yModel: number;
  zModel: number;
  xPrinted: number;
  yPrinted: number;
  zPrinted: number;
  xScale: number;
  yScale: number;
  zScale: number;
  xIncrease: number;
  yIncrease: number;
  zIncrease: number;
  xDecrease: number;
  yDecrease: number;
  zDecrease: number;
  xTolerance: number;
  yTolerance: number;
  zTolerance: number;
};

export type ScaleAction =
  | { type: "SET_MODEL"; axis: "x" | "y" | "z"; value: number }
  | { type: "SET_PRINTED"; axis: "x" | "y" | "z"; value: number }
  | { type: "SET_INCREASE"; axis: "x" | "y" | "z"; value: number }
  | { type: "SET_DECREASE"; axis: "x" | "y" | "z"; value: number };

export const initialScaleState: ScaleState = {
  xModel: 0,
  yModel: 0,
  zModel: 0,
  xPrinted: 0,
  yPrinted: 0,
  zPrinted: 0,
  xScale: 0,
  yScale: 0,
  zScale: 0,
  xIncrease: 0,
  yIncrease: 0,
  zIncrease: 0,
  xDecrease: 0,
  yDecrease: 0,
  zDecrease: 0,
  xTolerance: 0,
  yTolerance: 0,
  zTolerance: 0,
};

function truncate(value: number) {
  return Math.round(value * 100) / 100;
}

export function scaleReducer(
  state: ScaleState,
  action: ScaleAction,
): ScaleState {
  switch (action.type) {
    case "SET_MODEL": {
      const { axis, value } = action;
      const printed = state[axis + "Printed"];
      const scale = getBaseScale(value, printed);
      return {
        ...state,
        [axis + "Model"]: value,
        [axis + "Scale"]: scale,
      };
    }
    case "SET_PRINTED": {
      const { axis, value } = action;
      const model = state[axis + "Model"];
      const scale = getBaseScale(model, value);
      return {
        ...state,
        [axis + "Printed"]: value,
        [axis + "Scale"]: scale,
      };
    }
    case "SET_INCREASE": {
      const { axis, value: increase } = action;
      const printed = state[axis + "Printed"];
      const model = state[axis + "Model"];
      const decreased = state[axis + "Decrease"];
      const baseScale = getBaseScale(model, printed);
      const increaseTolerance = getTolerance(increase, printed);
      const decreaseTolerance = getTolerance(decreased, printed);
      let newScale = baseScale;
      if (increase && decreased) {
        newScale = truncate(baseScale - increaseTolerance + decreaseTolerance);
      } else if (increase) {
        newScale = truncate(baseScale - increaseTolerance);
      } else if (decreased) {
        newScale = truncate(baseScale + decreaseTolerance);
      }
      const overall = truncate((newScale * printed) / 100);
      return {
        ...state,
        [axis + "Increase"]: increase,
        [axis + "Tolerance"]: overall,
        [axis + "Scale"]: Math.abs(newScale),
      };
    }
    case "SET_DECREASE": {
      const { axis, value: decreased } = action;
      const printed = state[axis + "Printed"];
      const model = state[axis + "Model"];
      const increase = state[axis + "Increase"];
      const baseScale = getBaseScale(model, printed);
      const decreaseTolerance = getTolerance(decreased, printed);
      const increaseTolerance = getTolerance(increase, printed);
      let newScale = baseScale;
      if (decreased && increase) {
        newScale = truncate(baseScale + decreaseTolerance - increaseTolerance);
      } else if (decreased) {
        newScale = truncate(baseScale + decreaseTolerance);
      } else if (increase) {
        newScale = truncate(baseScale - increaseTolerance);
      }
      const overall = truncate((newScale * printed) / 100);
      return {
        ...state,
        [axis + "Decrease"]: decreased,
        [axis + "Tolerance"]: overall,
        [axis + "Scale"]: Math.abs(newScale),
      };
    }
    default:
      return state;
  }
}
