import * as React from "react"

declare module "@radix-ui/react-slot" {
  interface SlotProps {
    children?: React.ReactNode
  }
}
