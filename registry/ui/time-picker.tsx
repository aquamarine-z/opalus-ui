"use client"

import * as React from "react"

import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type TimePickerContextValue = {
  setTime: (id: symbol, value?: number) => void
}

const TimePickerContext = React.createContext<TimePickerContextValue>({
  setTime: () => undefined,
})

type TimePickerContainerProps = {
  children?: React.ReactNode
  onTimeChange?: (value: number) => void
}

function TimePickerContainer({
  children,
  onTimeChange,
}: TimePickerContainerProps) {
  const [times, setTimes] = React.useState<ReadonlyMap<symbol, number>>(
    () => new Map()
  )

  const setTime = React.useCallback((id: symbol, value?: number) => {
    setTimes((current) => {
      const next = new Map(current)

      if (value === undefined) {
        next.delete(id)
      } else {
        next.set(id, value)
      }

      return next
    })
  }, [])

  const totalTime = React.useMemo(
    () => Array.from(times.values()).reduce((total, value) => total + value, 0),
    [times]
  )

  React.useEffect(() => {
    onTimeChange?.(totalTime)
  }, [onTimeChange, totalTime])

  const contextValue = React.useMemo(() => ({ setTime }), [setTime])

  return (
    <TimePickerContext.Provider value={contextValue}>
      {children}
    </TimePickerContext.Provider>
  )
}

type TimePickerProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  timeMilliseconds?: number
  step?: number
  minValue?: number
  maxValue?: number
  prefixLabel?: ((value: number) => React.ReactNode) | React.ReactNode
  suffixLabel?: ((value: number) => React.ReactNode) | React.ReactNode
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}

function TimePicker({
  timeMilliseconds = 1,
  step = 1,
  maxValue = 1000,
  minValue = 0,
  value,
  defaultValue = minValue,
  onValueChange,
  prefixLabel,
  suffixLabel,
  className,
  ...props
}: TimePickerProps) {
  const id = React.useRef(Symbol("time-picker"))
  const { setTime } = React.useContext(TimePickerContext)
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const selectedValue = Math.min(
    maxValue,
    Math.max(minValue, isControlled ? value : internalValue)
  )

  React.useEffect(() => {
    setTime(id.current, selectedValue * timeMilliseconds)

    return () => setTime(id.current)
  }, [selectedValue, setTime, timeMilliseconds])

  const handleValueChange = React.useCallback(
    (nextValues: number | readonly number[]) => {
      const nextValue =
        typeof nextValues === "number"
          ? nextValues
          : (nextValues[0] ?? minValue)

      if (!isControlled) {
        setInternalValue(nextValue)
      }

      onValueChange?.(nextValue)
    },
    [isControlled, minValue, onValueChange]
  )

  const prefix =
    typeof prefixLabel === "function"
      ? prefixLabel(selectedValue)
      : prefixLabel
  const suffix =
    typeof suffixLabel === "function"
      ? suffixLabel(selectedValue)
      : suffixLabel

  return (
    <div
      className={cn(
        "flex h-fit w-full flex-row items-center justify-around gap-2",
        className
      )}
      {...props}
    >
      {prefix}
      <Slider
        value={[selectedValue]}
        min={minValue}
        max={maxValue}
        step={step}
        onValueChange={handleValueChange}
      />
      {suffix}
    </div>
  )
}

export { TimePicker, TimePickerContainer }
export type { TimePickerContainerProps, TimePickerProps }
