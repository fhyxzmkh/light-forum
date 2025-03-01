import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/message/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="w-full h-screen bg-gray-100 flex">
        <div className="w-3/5 bg-white mx-auto mt-5"></div>
      </div>
    </>
  );
}
