"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 bg-[#C7CEDA] data-[checked]:bg-[#16233F] data-[size=default]:h-[22px] data-[size=default]:w-[38px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform group-data-[size=default]/switch:size-4.5 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-[checked]:translate-x-[18px] group-data-[size=default]/switch:translate-x-[2px] group-data-[size=sm]/switch:data-[checked]:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:translate-x-0"
        style={{ width: '18px', height: '18px' }}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
