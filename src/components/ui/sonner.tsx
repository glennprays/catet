"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      duration={4000}
      icons={{
        success: <CircleCheckIcon className="size-4 text-safe" strokeWidth={1.75} />,
        info: <InfoIcon className="size-4 text-ink-soft" strokeWidth={1.75} />,
        warning: <TriangleAlertIcon className="size-4 text-warn" strokeWidth={1.75} />,
        error: <OctagonXIcon className="size-4 text-over" strokeWidth={1.75} />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          "--normal-bg": "var(--sheet)",
          "--normal-text": "var(--ink)",
          "--normal-border": "var(--border)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          title: "text-[13px] font-medium",
          description: "text-[12px] text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
