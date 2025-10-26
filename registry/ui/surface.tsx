"use client";
import React, {type ReactNode, useRef} from "react";
import NiceModal, {useModal} from "@ebay/nice-modal-react";
import {Button} from "@/components/ui/button.tsx";
import {AlertCircle, XIcon} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {cn} from "@/lib/utils"
import {Dialog, DialogClose, DialogHeader, DialogPortal, DialogTitle} from "@/components/ui/dialog.tsx";

function SurfaceDialogOverlay({
                                  className,
                                  closeWhenClick = true,
                                  ...props
                              }: React.ComponentProps<typeof DialogPrimitive.Overlay> & {
    closeWhenClick?: boolean
}) {
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
                className
            )}
            onClick={closeWhenClick ? undefined : (e) => e.stopPropagation()}
            onPointerDownCapture={closeWhenClick ? undefined : (e) => e.stopPropagation()}
            {...props}
        />
    )
}

export function SurfaceDialogContent({
                                         className,
                                         children,
                                         showCloseButton = true,
                                         closeOnClickOverlay = true,
                                         ...props
                                     }: React.ComponentProps<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean,
    closeOnClickOverlay?: boolean
}) {
    return (
        <DialogPortal data-slot="dialog-portal">
            <SurfaceDialogOverlay closeWhenClick={closeOnClickOverlay}/>
            <DialogPrimitive.Content
                data-slot="dialog-content"
                className={cn(
                    "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close
                        data-slot="dialog-close"
                        className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                    >
                        <XIcon/>
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    )
}

type CustomSurfaceProps = {
    content: (close: (result?: any) => Promise<void>) => ReactNode;
    resolve?: (value: any) => void;
};
export type CustomDialogOptions = {
    modal?: boolean;
}
export type DialogOptions = {
    hasCloseButton?: boolean;
    title?: ReactNode;
    titleIcon?: ReactNode;
    showTitleIcon?: boolean;
    modal?: boolean;
    closeOnCloseOverlay?: boolean;
}
export type AlertDialogOptions = {
    message?: ReactNode | ReactNode[];
    closeButtonContent?: ReactNode;
} & DialogOptions;
export type ConfirmDialogOptions = {
    message?: ReactNode | ReactNode[];
    confirmButtonContent?: ReactNode;
    cancelButtonContent?: ReactNode;
} & DialogOptions;
export type PromptDialogOptions = {
    message?: ReactNode | ReactNode[];
    defaultValue?: string;
    placeholder?: string;
    confirmButtonContent?: ReactNode;
    cancelButtonContent?: ReactNode;
} & DialogOptions;

export const dialog = {
    custom: <T = any>(
        content: (close: (result?: T) => Promise<void>) => React.ReactNode,
        options?: CustomDialogOptions,
    ): Promise<T | undefined> => {
        const CustomModal = NiceModal.create(
            ({
                 content,
                 resolve,
             }: CustomSurfaceProps) => {
                const isModal = options?.modal ?? true;
                const modalContext = useModal();
                const resultRef = useRef<T>(undefined);
                const resolved = useRef<boolean>(false);
                const handleClose = async (result?: any, isAuto: boolean = false) => {
                    modalContext.hide();
                    if (!resolved.current) {
                        resultRef.current = result;
                        resolved.current = true;
                    }
                };
                const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
                    const target = e.target as HTMLElement;
                    if (target.dataset.state === "closed") {
                        let result = resultRef.current;
                        resolve?.(result);
                        resolved.current = true
                        modalContext.remove();
                    }
                };
                const wrappedContent = (() => {
                    const node = content(handleClose);
                    if (React.isValidElement(node)) {
                        return React.cloneElement(
                            node as React.ReactElement<any>,
                            {
                                onAnimationEnd: (e: React.AnimationEvent<HTMLDivElement>) => {
                                    handleAnimationEnd(e);
                                    (node.props as any)?.onAnimationEnd?.(e);
                                },
                            } as Partial<React.DOMAttributes<HTMLDivElement>>
                        );
                    }
                    return node;
                })();
                return (
                    <Dialog
                        modal={isModal}
                        open={modalContext.visible}
                        onOpenChange={async (v) => {
                            if (!v && modalContext.visible) {

                                if (!isModal) return;
                                await handleClose(undefined, true);
                            }
                        }}
                    >
                        {wrappedContent}
                    </Dialog>
                );
            }
        );
        return new Promise(async (resolve) => {
            await NiceModal.show(CustomModal, {
                content,
                resolve,
            });
        });
    },
    alert: (options: AlertDialogOptions) => {
        return dialog.custom<null>(
            (close,) => {
                return <SurfaceDialogContent closeOnClickOverlay={options.closeOnCloseOverlay ?? true}
                                             showCloseButton={options.hasCloseButton ?? true}>
                    <DialogHeader>
                        <DialogTitle className={"flex flex-row items-center gap-2"}>
                            {(options.showTitleIcon ?? true) && (options.titleIcon ||
                                <AlertCircle className={"h-5 w-5"}/>)}
                            {options.title || "Alert"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className={"flex flex-col gap-3 items-center"}>
                        <div>{options.message}</div>
                        <DialogClose asChild onClick={() => close()}>
                            {options.closeButtonContent || <Button variant={"default"}>Close</Button>}
                        </DialogClose>
                    </div>
                </SurfaceDialogContent>
            },
            {modal: options.modal ?? true,}
        )
    },
    confirm: (options: ConfirmDialogOptions) => {
        return dialog.custom<boolean>((close) => {
                return <SurfaceDialogContent closeOnClickOverlay={options.closeOnCloseOverlay ?? true}
                                             showCloseButton={options.hasCloseButton ?? true}>
                    <DialogHeader>
                        <DialogTitle className={"flex flex-row items-center gap-2"}>
                            {(options.showTitleIcon ?? true) && (options.titleIcon || <AlertCircle className={"h-5 w-5"}/>)}
                            {options.title || "Confirm"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className={"flex flex-col gap-3 items-center"}>
                        <div>{options.message}</div>
                        <div className={"flex flex-row gap-3"}>
                            <DialogClose asChild onClick={() => close(false)}>
                                {options.cancelButtonContent || <Button variant={"outline"}>Cancel</Button>}
                            </DialogClose>
                            <DialogClose asChild onClick={() => close(true)}>
                                {options.confirmButtonContent || <Button>Confirm</Button>}
                            </DialogClose>
                        </div>
                    </div>
                </SurfaceDialogContent>
            },
            {modal: options.modal ?? true,}
        )
    },
    prompt: (options: PromptDialogOptions) => {
        return dialog.custom<string | null>((close) => {
                const [inputValue, setInputValue] = React.useState<string>(options.defaultValue || "");
                return <SurfaceDialogContent closeOnClickOverlay={options.closeOnCloseOverlay ?? true}
                                             showCloseButton={options.hasCloseButton ?? true}>
                    <DialogHeader>
                        <DialogTitle className={"flex flex-row items-center gap-2"}>
                            {(options.showTitleIcon ?? true) && (options.titleIcon || <AlertCircle className={"h-5 w-5"}/>)}
                            {options.title || "Prompt"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className={"flex flex-col gap-3 items-center"}>
                        <div>{options.message}</div>
                        <Input placeholder={options.placeholder} value={inputValue}
                               onChange={e => setInputValue(e.target.value)}/>
                        <DialogClose asChild onClick={() => close(inputValue)}>
                            {options.confirmButtonContent || <Button>Confirm</Button>}
                        </DialogClose>
                    </div>
                </SurfaceDialogContent>
            },
            {modal: options.modal ?? true,}
        )
    }
}
export const surface = {}
export const drawer = {}