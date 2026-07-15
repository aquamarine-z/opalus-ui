import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

Object.defineProperty(HTMLElement.prototype, "getAnimations", {
  configurable: true,
  value: () => [],
})

afterEach(() => {
  cleanup()
})
