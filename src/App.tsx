import { useState } from "react";
import {
  Box,
  Button,
  Image,
  Link,
  Heading,
  Text,
  Code,
} from "@chakra-ui/react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Box textAlign="center" p={5}>
      <Box display="flex" justifyContent="center" mb={5}>
        <Link href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <Image
            src={viteLogo}
            className="logo"
            alt="Vite logo"
            boxSize="100px"
          />
        </Link>
        <Link
          href="https://react.dev"
          target="_blank"
          rel="noopener noreferrer"
          ml={5}
        >
          <Image
            src={reactLogo}
            className="logo react"
            alt="React logo"
            boxSize="100px"
          />
        </Link>
      </Box>
      <Heading as="h1" size="2xl" mb={5}>
        Vite + React
      </Heading>
      <Box className="card" p={5} borderWidth="1px" borderRadius="lg">
        <Button onClick={() => setCount((count) => count + 1)} mb={3}>
          count is {count}
        </Button>
        <Text>
          Edit <Code>src/App.tsx</Code> and save to test HMR
        </Text>
      </Box>
      <Text className="read-the-docs" mt={5}>
        Click on the Vite and React logos to learn more
      </Text>
    </Box>
  );
}

export default App;
