import * as React from "react";
import styled, { css } from "styled-components";

type FontSize = "body" | "bodyS" | "bodyXS" | "bodyXXS";
type FontWeight = "regular" | "medium" | "bold" | "black";

type BodyBaseProps = {
  size: string;
  fontWeight?: string;
  color?: string;
  as?: "span" | "p" | "label" | "figcaption";
};

const BodyBase = styled.p.withConfig({
  shouldForwardProp: (prop) =>
    ["size", "fontWeight", "color", "as", "className", "children"].includes(
      prop,
    ),
})<BodyBaseProps>(
  ({ size, fontWeight, color: textColor, theme: { typography, color } }) => css`
    display: block;
    font-family: "Hind", sans-serif;
    color: ${textColor || color.primaryText};
    font-weight: ${typography.fontWeight[fontWeight as FontWeight]};
    font-size: ${typography.fontSize[
      size ? (`body${size}` as FontSize) : "body"
    ]};
  `,
);

type DefaultProps = {
  className?: string;
  size?: "S" | "XS" | "XXS";
  fontWeight?: "regular" | "medium" | "bold" | "black";
  type?: "span" | "p" | "label" | "figcaption";
  color?: string;
  children: React.ReactNode | string;
};

type BodyProps = DefaultProps & React.ComponentProps<typeof BodyBase>;

export const Body: React.FC<BodyProps> = ({
  size = "",
  fontWeight = "regular",
  type = "p",
  color,
  children,
  className,
  ...props
}) => (
  <BodyBase
    as={type}
    size={size}
    color={color}
    fontWeight={fontWeight}
    className={className}
    {...props}
  >
    {children}
  </BodyBase>
);
