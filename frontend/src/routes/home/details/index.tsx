import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/home/details/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/home/details/"!</div>
}
