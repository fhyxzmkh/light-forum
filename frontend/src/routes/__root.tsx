import {
  createRootRoute,
  Link,
  Outlet,
  useMatchRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { NavBar } from "../components/common/NavBar.tsx";
import { Button, Result } from "antd";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary">
            <Link to="/">Back Home</Link>
          </Button>
        }
      />
    );
  },
});

function RootComponent() {
  const hideNavRoutes = ["/user/login/", "/user/register/"];

  const matchRoute = useMatchRoute();

  const matchedHideNavRoutes = hideNavRoutes.some((route) =>
    matchRoute({ to: route }),
  );

  return (
    <>
      {!matchedHideNavRoutes ? <NavBar /> : null}
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
