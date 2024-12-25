import { memo, useMemo } from "react";
import SVG from "react-inlinesvg";

export type AllowedIcons =
  | "check"
  | "home"
  | "data"
  | "filters"
  | "home"
  | "range"
  | "report"
  | "experian"
  | "circle"
  | "completed"
  | "external_link"
  | "info"
  | "finder"
  | "search"
  | "acquireModel"
  | "pulse"
  | "foresight"
  | "target"
  | "optimize"
  | "limit"
  | "collect"
  | "challenger"
  | "arrowLeft"
  | "gear"
  | "assignment"
  | "dataFurnisher"
  | "lightbulb"
  | "compare"
  | "download"
  | "dashboards";

export interface IconProps {
  name: AllowedIcons;
  width?: number | string;
  height?: number | string;
  color?: string;
}

export interface BuildStatusProps {
  status: string;
}

const Icon = memo(({ name, width = 24, height = 24, color }: IconProps) => {
  const finalUrl = useMemo(() => `./assets/icons/${name}.svg`, [name]);

  return (
    <SVG
      src={finalUrl}
      width={width}
      height={height}
      color={color}
      fill={color}
    />
  );
});

export default Icon;
