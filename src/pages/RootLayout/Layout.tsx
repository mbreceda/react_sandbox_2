import {
  Await,
  Outlet,
  useNavigation,
  useRevalidator,
  useRouteLoaderData,
} from "react-router-dom";
import { LoadingProvider } from "../../hooks/useLoadingHook/useLoadingHook";

interface UserInfo {
  name: string;
  age: number;
}

export default function RootLayout() {
  const { userInfo } = useRouteLoaderData("root-loader") as {
    userInfo: Promise<UserInfo>;
  };

  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const isLoading =
    navigation.state !== "idle" || revalidator.state === "loading";

  console.log(isLoading);

  return (
    <LoadingProvider isLoading={isLoading}>
      <main>
        <Await resolve={userInfo}>
          {({ name, age }) => (
            <h1>
              {name} ({age})
            </h1>
          )}
        </Await>
        <Outlet />
      </main>
    </LoadingProvider>
  );
}
