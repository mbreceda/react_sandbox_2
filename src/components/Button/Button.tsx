import React from "react";

export interface ButtonProps {
  /** Is this the principal call to action on the page? */
  primary?: boolean;
  /** What background color to use */
  backgroundColor?: string;
  /** How large should the button be? */
  size?: "small" | "medium" | "large";
  /** Button contents */
  label: string;
  /** Optional click handler */
  onClick?: () => void;
}

/** Primary UI component for user interaction */
export const Button = ({
  primary = false,
  size = "medium",
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  // Tailwind equivalents for button.css
  const base = [
    "inline-block cursor-pointer border-0 rounded-full font-bold leading-none font-sans",
    backgroundColor ? "" : "", // backgroundColor prop overrides Tailwind bg
  ];
  const mode = primary
    ? "bg-[#1ea7fd] text-white"
    : "bg-transparent text-[#333] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]";
  const sizeClass =
    size === "small"
      ? "px-4 py-2 text-xs"
      : size === "large"
        ? "px-6 py-3 text-base"
        : "px-5 py-2.5 text-sm";

  return (
    <button
      type="button"
      className={[...base, mode, sizeClass].join(" ")}
      style={{ backgroundColor }}
      {...props}
    >
      {label}
    </button>
  );
};
