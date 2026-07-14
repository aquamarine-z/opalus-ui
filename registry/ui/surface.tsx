"use client"

import * as React from "react"
import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { AlertCircleIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SurfaceDialogContextValue = {
  close: () => Promise<void>
  closing: boolean
  finishClose: () => void
  open: boolean
}

const SurfaceDialogContext = React.createContext<SurfaceDialogContextValue | null>(
  null
)

type SurfaceDialogContentProps = Omit<
  React.ComponentProps<typeof DialogContent>,
  "showCloseButton"
> & {
  showCloseButton?: boolean
}

function SurfaceDialogContent({
  className,
  children,
  showCloseButton = true,
  ref,
  ...props
}: SurfaceDialogContentProps) {
  const context = React.useContext(SurfaceDialogContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const setContentRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      contentRef.current = element

      if (typeof ref === "function") {
        ref(element)
      } else if (ref) {
        ref.current = element
      }
    },
    [ref]
  )

  React.useEffect(() => {
    if (!context || !context.closing || context.open) return

    let active = true
    const frame = window.requestAnimationFrame(() => {
      const animations = (contentRef.current?.getAnimations() ?? []).filter(
        (animation) =>
          animation.playState !== "finished" &&
          animation.effect?.getComputedTiming().iterations !== Infinity
      )

      if (animations.length === 0) {
        context.finishClose()
        return
      }

      void Promise.allSettled(
        animations.map((animation) => animation.finished)
      ).then(() => {
        if (active) context.finishClose()
      })
    })

    return () => {
      active = false
      window.cancelAnimationFrame(frame)
    }
  }, [context])

  if (!context) {
    throw new Error("SurfaceDialogContent must be rendered inside dialog.custom().")
  }

  return (
    <DialogContent
      ref={setContentRef}
      showCloseButton={false}
      className={cn("sm:max-w-lg", className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          aria-label="Close"
          onClick={() => void context.close()}
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </Button>
      )}
    </DialogContent>
  )
}

type CustomDialogOptions = {
  modal?: boolean
  closeOnOverlayClick?: boolean
}

type DialogOptions = CustomDialogOptions & {
  showCloseButton?: boolean
  title?: React.ReactNode
  titleIcon?: React.ReactNode
  showTitleIcon?: boolean
}

type AlertDialogOptions = DialogOptions & {
  message?: React.ReactNode
  closeButtonContent?: React.ReactNode
}

type ConfirmDialogOptions = DialogOptions & {
  message?: React.ReactNode
  confirmButtonContent?: React.ReactNode
  cancelButtonContent?: React.ReactNode
}

type PromptDialogOptions = DialogOptions & {
  message?: React.ReactNode
  defaultValue?: string
  placeholder?: string
  confirmButtonContent?: React.ReactNode
  cancelButtonContent?: React.ReactNode
}

type CustomSurfaceProps<T> = {
  content: (close: (result?: T) => Promise<void>) => React.ReactNode
  options: CustomDialogOptions
}

function DialogHeading({ options }: { options: DialogOptions }) {
  return (
    <DialogHeader>
      <DialogTitle className="flex flex-row items-center gap-2">
        {(options.showTitleIcon ?? true) &&
          (options.titleIcon ?? <AlertCircleIcon className="size-5" />)}
        {options.title ?? "Dialog"}
      </DialogTitle>
    </DialogHeader>
  )
}

function custom<T = unknown>(
  content: (close: (result?: T) => Promise<void>) => React.ReactNode,
  options: CustomDialogOptions = {}
): Promise<T | undefined> {
  const CustomModal = NiceModal.create<CustomSurfaceProps<T>>(
    ({ content: renderContent, options: modalOptions }) => {
      const modal = useModal()
      const [closing, setClosing] = React.useState(false)
      const resolved = React.useRef(false)
      const removed = React.useRef(false)
      const closeOnOverlayClick = modalOptions.closeOnOverlayClick ?? true
      const isModal = modalOptions.modal ?? true

      const finishClose = React.useCallback(() => {
        if (removed.current) return

        removed.current = true
        modal.resolveHide()
        modal.remove()
      }, [modal])

      const handleClose = React.useCallback(
        async (result?: T) => {
          if (resolved.current) return

          resolved.current = true
          modal.resolve(result)
          setClosing(true)
          void modal.hide()
        },
        [modal]
      )

      React.useEffect(() => {
        if (!modal.visible || closeOnOverlayClick || !isModal) return

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key !== "Escape") return

          event.preventDefault()
          event.stopPropagation()
          void handleClose()
        }

        document.addEventListener("keydown", handleKeyDown, true)
        return () => document.removeEventListener("keydown", handleKeyDown, true)
      }, [closeOnOverlayClick, handleClose, isModal, modal.visible])

      const contextValue = React.useMemo<SurfaceDialogContextValue>(
        () => ({
          close: () => handleClose(),
          closing,
          finishClose,
          open: modal.visible,
        }),
        [closing, finishClose, handleClose, modal.visible]
      )

      return (
        <SurfaceDialogContext.Provider value={contextValue}>
          <Dialog
            modal={isModal}
            open={modal.visible}
            onOpenChange={(open) => {
              if (open || !modal.visible || !isModal || !closeOnOverlayClick) {
                return
              }

              void handleClose()
            }}
          >
            {renderContent(handleClose)}
          </Dialog>
        </SurfaceDialogContext.Provider>
      )
    }
  )

  return NiceModal.show(CustomModal, { content, options }) as Promise<
    T | undefined
  >
}

const dialog = {
  custom,

  alert(options: AlertDialogOptions = {}): Promise<null | undefined> {
    return custom<null>(
      (close) => (
        <SurfaceDialogContent
          showCloseButton={options.showCloseButton ?? true}
        >
          <DialogHeading options={{ ...options, title: options.title ?? "Alert" }} />
          <div className="flex flex-col items-center gap-3">
            <div>{options.message}</div>
            <Button type="button" onClick={() => void close(null)}>
              {options.closeButtonContent ?? "Close"}
            </Button>
          </div>
        </SurfaceDialogContent>
      ),
      options
    )
  },

  confirm(options: ConfirmDialogOptions = {}): Promise<boolean | undefined> {
    return custom<boolean>(
      (close) => (
        <SurfaceDialogContent
          showCloseButton={options.showCloseButton ?? true}
        >
          <DialogHeading
            options={{ ...options, title: options.title ?? "Confirm" }}
          />
          <div className="flex flex-col items-center gap-3">
            <div>{options.message}</div>
            <div className="flex flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => void close(false)}
              >
                {options.cancelButtonContent ?? "Cancel"}
              </Button>
              <Button type="button" onClick={() => void close(true)}>
                {options.confirmButtonContent ?? "Confirm"}
              </Button>
            </div>
          </div>
        </SurfaceDialogContent>
      ),
      options
    )
  },

  prompt(
    options: PromptDialogOptions = {}
  ): Promise<string | null | undefined> {
    return custom<string | null>(
      (close) => {
        const [inputValue, setInputValue] = React.useState(
          options.defaultValue ?? ""
        )

        return (
          <SurfaceDialogContent
            showCloseButton={options.showCloseButton ?? true}
          >
            <DialogHeading
              options={{ ...options, title: options.title ?? "Prompt" }}
            />
            <div className="flex flex-col items-center gap-3">
              <div>{options.message}</div>
              <Input
                placeholder={options.placeholder}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
              />
              <div className="flex flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void close(null)}
                >
                  {options.cancelButtonContent ?? "Cancel"}
                </Button>
                <Button type="button" onClick={() => void close(inputValue)}>
                  {options.confirmButtonContent ?? "Confirm"}
                </Button>
              </div>
            </div>
          </SurfaceDialogContent>
        )
      },
      options
    )
  },
}

export { dialog, SurfaceDialogContent }
export type {
  AlertDialogOptions,
  ConfirmDialogOptions,
  CustomDialogOptions,
  DialogOptions,
  PromptDialogOptions,
  SurfaceDialogContentProps,
}
