// filepath: /Users/miguelbrecedadelara/Developer/my-react-app/src/components/LoadingLayout.tsx
import { Spinner, Box, Center } from "@chakra-ui/react";
import { useNavigation, useRevalidator } from "react-router-dom";

const LoadingLayout = ({ children }) => {
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const isLoading =
    navigation.state !== "idle" || revalidator.state === "loading";
  console.log(isLoading);

  return (
    <Center height="100vh">
      <Box textAlign="center">
        {isLoading && <Spinner size="xl" />} {children}
      </Box>
    </Center>
  );
};

export default LoadingLayout;
