import { Box, Flex, Heading } from "@chakra-ui/react";
import { Separator } from "../../components/Separator";
import { Icon } from "../../components/Icon";

interface HeaderProps {
  px?: number;
  py?: number;
}

export default function Header({ px = 4, py = 4 }: HeaderProps) {
  return (
    <Flex
      as="header"
      h="16"
      bgColor="gray.white"
      px={px}
      py={py}
      borderBottomColor="pastels.marianBlue"
      borderBottomWidth="thin"
      alignItems="center"
    >
      <Box>
        <Icon name="experian" />
      </Box>
      <Separator />
      <Box>
        <Heading size={"md"} fontWeight={"400"}>
          Ascend Intelligence Services
        </Heading>
      </Box>
    </Flex>
  );
}
