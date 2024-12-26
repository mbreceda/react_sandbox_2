import React from "react";
import { Box } from "@chakra-ui/react";

interface SeparatorProps {
  px?: number | string;
  height?: number | string;
  color?: string;
}

const Separator: React.FC<SeparatorProps> = ({
  px = 4,
  height = 10,
  color = "lightgray",
}) => {
  return (
    <Box mx={px} h={height} borderLeftWidth="thin" borderLeftColor={color} />
  );
};

export default Separator;
