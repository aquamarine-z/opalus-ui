"use client"

import * as React from "react"
import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { AlertCircleIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ContentElement = HTMLDivElement | null

type SurfaceDialogContextValue = {
  close: () => Promise<void>
  setContentElement: (element: ContentElement) => void
}

const SurfaceDialogContext = React.createContext<SurfaceDialogContextValue | null>(
  null
)

function useSurfaceLifecycle<T>(
  modal: ReturnType<typeof useModal>,
  resolveResult: (result: T | undefined) => void
) {
  const modalRef = React.useRef(modal)
  const contentRef = React.useRef<ContentElement>(null)
  const resultRef = React.useRef<T | undefined>(undefined)
  const closePromiseRef = React.useRef<Promise<void> | null>(null)
  const removedRef = React.useRef(false)
  const [closing, setClosing] = React.useState(false)
  const [contentElement, setContentElementState] =
    React.useState<ContentElement>(null)

  modalRef.current = modal

  const setContentElement = React.useCallback((element: ContentElement) => {
    contentRef.current = element
    setContentElementState(element)
  }, [])

  const finishClose = React.useCallback(() => {
    if (removedRef.current) return

    removedRef.current = true
    const currentModal = modalRef.current
    resolveResult(resultRef.current)
    currentModal.resolveHide()
    currentModal.remove()
  }, [resolveResult])

  const close = React.useCallback((result?: T): Promise<void> => {
    if (closePromiseRef.current) return closePromiseRef.current

    resultRef.current = result
    setClosing(true)
    closePromiseRef.current = Promise.resolve(modalRef.current.hide()).then(
      () => undefined
    )

    return closePromiseRef.current
  }, [])

  React.useEffect(() => {
    if (!closing || modal.visible) return

    let active = true
    const frame = window.requestAnimationFrame(() => {
      const animations = (contentRef.current?.getAnimations() ?? []).filter(
        (animation) =>
          animation.playState !== "finished" &&
          animation.effect?.getComputedTiming().iterations !== Infinity
      )

      if (animations.length === 0) {
        finishClose()
        return
      }

      void Promise.allSettled(
        animations.map((animation) => animation.finished)
      ).then(() => {
        if (active) finishClose()
      })
    })

    return () => {
      active = false
      window.cancelAnimationFrame(frame)
    }
  }, [closing, finishClose, modal.visible])

  return { close, contentElement, setContentElement }
}

type SurfaceDialogContentProps = Omit<
  React.ComponentProps<typeof DialogContent>,
  "showCloseButton"
> & {
  closeButtonLabel?: string
  showCloseButton?: boolean
}

function SurfaceDialogContent({
  className,
  children,
  closeButtonLabel = "Close",
  showCloseButton = true,
  ref,
  ...props
}: SurfaceDialogContentProps) {
  const context = React.useContext(SurfaceDialogContext)

  const setContentRef = React.useCallback(
    (element: ContentElement) => {
      context?.setContentElement(element)

      if (typeof ref === "function") {
        ref(element)
      } else if (ref) {
        ref.current = element
      }
    },
    [context, ref]
  )

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
          aria-label={closeButtonLabel}
          onClick={() => void context.close()}
        >
          <XIcon aria-hidden="true" />
        </Button>
      )}
    </DialogContent>
  )
}

type SurfaceButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "onClick" | "type"
>

type CustomDialogOptions = {
  modal?: boolean
  closeOnOverlayClick?: boolean
}

type DialogOptions = CustomDialogOptions & {
  showCloseButton?: boolean
  closeButtonLabel?: string
  title?: React.ReactNode
  titleIcon?: React.ReactNode
  showTitleIcon?: boolean
}

type AlertDialogOptions = DialogOptions & {
  message?: React.ReactNode
  closeButtonContent?: React.ReactNode
  closeButtonProps?: SurfaceButtonProps
}

type ConfirmDialogOptions = DialogOptions & {
  message?: React.ReactNode
  confirmButtonContent?: React.ReactNode
  confirmButtonProps?: SurfaceButtonProps
  cancelButtonContent?: React.ReactNode
  cancelButtonProps?: SurfaceButtonProps
}

type PromptDialogOptions = DialogOptions & {
  message?: React.ReactNode
  inputLabel?: string
  defaultValue?: string
  placeholder?: string
  inputProps?: Omit<
    React.ComponentProps<typeof Input>,
    "defaultValue" | "name" | "value"
  >
  confirmButtonContent?: React.ReactNode
  confirmButtonProps?: SurfaceButtonProps
  cancelButtonContent?: React.ReactNode
  cancelButtonProps?: SurfaceButtonProps
}

type CustomSurfaceProps<T> = {
  content: (close: (result?: T) => Promise<void>) => React.ReactNode
  options: CustomDialogOptions
  resolveResult: (result: T | undefined) => void
}

function custom<T = unknown>(
  content: (close: (result?: T) => Promise<void>) => React.ReactNode,
  options: CustomDialogOptions = {}
): Promise<T | undefined> {
  const CustomSurfaceModal = NiceModal.create<CustomSurfaceProps<T>>(
    ({ content: renderContent, options: modalOptions, resolveResult }) => {
      const modal = useModal()
      const { close, contentElement, setContentElement } = useSurfaceLifecycle<T>(
        modal,
        resolveResult
      )
      const closeOnOverlayClick = modalOptions.closeOnOverlayClick ?? true
      const isModal = modalOptions.modal ?? true

      React.useEffect(() => {
        if (!modal.visible || closeOnOverlayClick || !isModal) return

        if (!contentElement) return

        const ownerDocument = contentElement.ownerDocument
        const handleKeyDown = (event: KeyboardEvent) => {
          if (
            event.key !== "Escape" ||
            !contentElement.contains(event.target as Node)
          ) {
            return
          }

          event.preventDefault()
          event.stopPropagation()
          void close()
        }

        ownerDocument.addEventListener("keydown", handleKeyDown, true)
        return () =>
          ownerDocument.removeEventListener("keydown", handleKeyDown, true)
      }, [
        close,
        closeOnOverlayClick,
        contentElement,
        isModal,
        modal.visible,
      ])

      const contextValue = React.useMemo<SurfaceDialogContextValue>(
        () => ({ close: () => close(), setContentElement }),
        [close, setContentElement]
      )

      return (
        <SurfaceDialogContext.Provider value={contextValue}>
          <Dialog
            modal={isModal}
            open={modal.visible}
            onOpenChange={(open) => {
              if (
                open ||
                !modal.visible ||
                !isModal ||
                !closeOnOverlayClick
              ) {
                return
              }

              void close()
            }}
          >
            {renderContent(close)}
          </Dialog>
        </SurfaceDialogContext.Provider>
      )
    }
  )

  return new Promise<T | undefined>((resolveResult) => {
    void NiceModal.show(CustomSurfaceModal, {
      content,
      options,
      resolveResult,
    })
  })
}

function titleIcon(options: DialogOptions) {
  if (!(options.showTitleIcon ?? true)) return null

  return (
    <span className="contents" aria-hidden="true">
      {options.titleIcon ?? <AlertCircleIcon className="size-5" />}
    </span>
  )
}

const dialog = {
  custom,

  async alert(options: AlertDialogOptions = {}): Promise<void> {
    await custom<null>(
      (close) => (
        <SurfaceDialogContent
          role="alertdialog"
          closeButtonLabel={options.closeButtonLabel}
          showCloseButton={options.showCloseButton ?? true}
        >
          <DialogHeader>
            <DialogTitle className="flex flex-row items-center gap-2">
              {titleIcon(options)}
              {options.title ?? "Alert"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3">
            <DialogDescription className="text-popover-foreground">
              {options.message}
            </DialogDescription>
            <Button
              {...options.closeButtonProps}
              type="button"
              onClick={() => void close(null)}
            >
              {options.closeButtonContent ?? "Close"}
            </Button>
          </div>
        </SurfaceDialogContent>
      ),
      {
        modal: options.modal,
        closeOnOverlayClick: options.closeOnOverlayClick ?? false,
      }
    )
  },

  async confirm(options: ConfirmDialogOptions = {}): Promise<boolean> {
    const result = await custom<boolean>(
      (close) => (
        <SurfaceDialogContent
          role="alertdialog"
          closeButtonLabel={options.closeButtonLabel}
          showCloseButton={options.showCloseButton ?? true}
        >
          <DialogHeader>
            <DialogTitle className="flex flex-row items-center gap-2">
              {titleIcon(options)}
              {options.title ?? "Confirm"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3">
            <DialogDescription className="text-popover-foreground">
              {options.message}
            </DialogDescription>
            <div className="flex flex-row gap-3">
              <Button
                {...options.cancelButtonProps}
                type="button"
                variant={options.cancelButtonProps?.variant ?? "outline"}
                onClick={() => void close(false)}
              >
                {options.cancelButtonContent ?? "Cancel"}
              </Button>
              <Button
                {...options.confirmButtonProps}
                type="button"
                onClick={() => void close(true)}
              >
                {options.confirmButtonContent ?? "Confirm"}
              </Button>
            </div>
          </div>
        </SurfaceDialogContent>
      ),
      {
        modal: options.modal,
        closeOnOverlayClick: options.closeOnOverlayClick ?? false,
      }
    )

    return result ?? false
  },

  async prompt(options: PromptDialogOptions = {}): Promise<string | null> {
    const result = await custom<string | null>(
      (close) => (
        <SurfaceDialogContent
          closeButtonLabel={options.closeButtonLabel}
          showCloseButton={options.showCloseButton ?? true}
        >
          <form
            className="contents"
            onSubmit={(event) => {
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              const value = formData.get("surface-prompt-value")
              void close(typeof value === "string" ? value : "")
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex flex-row items-center gap-2">
                {titleIcon(options)}
                {options.title ?? "Prompt"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3">
              <DialogDescription className="text-popover-foreground">
                {options.message}
              </DialogDescription>
              <Input
                {...options.inputProps}
                name="surface-prompt-value"
                aria-label={
                  options.inputLabel ??
                  options.inputProps?.["aria-label"] ??
                  "Input"
                }
                defaultValue={options.defaultValue}
                placeholder={options.placeholder}
                onKeyDown={(event) => {
                  options.inputProps?.onKeyDown?.(event)
                  if (
                    event.defaultPrevented ||
                    event.key !== "Enter" ||
                    event.nativeEvent.isComposing
                  ) {
                    return
                  }

                  event.preventDefault()
                  void close(event.currentTarget.value)
                }}
              />
              <div className="flex flex-row gap-3">
                <Button
                  {...options.cancelButtonProps}
                  type="button"
                  variant={options.cancelButtonProps?.variant ?? "outline"}
                  onClick={() => void close(null)}
                >
                  {options.cancelButtonContent ?? "Cancel"}
                </Button>
                <Button {...options.confirmButtonProps} type="submit">
                  {options.confirmButtonContent ?? "Confirm"}
                </Button>
              </div>
            </div>
          </form>
        </SurfaceDialogContent>
      ),
      options
    )

    return result ?? null
  },
}

export { dialog, SurfaceDialogContent }
export type {
  AlertDialogOptions,
  ConfirmDialogOptions,
  CustomDialogOptions,
  DialogOptions,
  PromptDialogOptions,
  SurfaceButtonProps,
  SurfaceDialogContentProps,
}
