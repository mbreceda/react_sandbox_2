import { Box, Heading, Text, useToken } from "@chakra-ui/react";

const NotFound = () => {
  const [grayDark] = useToken("colors", ["gray.dark"]);

  return (
    <Box>
      <Box p={10} mx="auto">
        <Heading size="lg" alignItems="center">
          <Text
            color={grayDark}
            fontSize="4xl"
            fontWeight="600"
            data-testid="pageTitle"
          >
            Project Not Found.
          </Text>
        </Heading>
        <Text fontSize="lg" mt={5} data-testid="pageDescription">
          Requested project could not be found or you don&apos;t have required
          permissions to access this project.
        </Text>
      </Box>
    </Box>
  );
};

export default NotFound;
