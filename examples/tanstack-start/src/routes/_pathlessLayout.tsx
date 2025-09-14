import { Outlet, createFileRoute } from '@tanstack/react-router'
import { css } from '@flow-css/core/css'

export const Route = createFileRoute('/_pathlessLayout')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <div className={css({ padding: "0.5rem" })}>
      <div className={css({ borderBottom: "1px solid #e5e7eb" })}>I'm a layout</div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
