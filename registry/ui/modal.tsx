"use client";
import React, {type ReactNode, useEffect} from "react";
import NiceModal, {useModal} from "@ebay/nice-modal-react";
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button.tsx";
import {AlertCircle} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";

type CustomModalProps = {
    content: (close: (result?: any) => Promise<void>) => ReactNode;
    resolve?: (value: any) => void;
};
export type ModalOptions = {
    hasCloseButton?: boolean;
    title?: ReactNode;
    titleIcon?: ReactNode;
    showTitleIcon?: boolean;
}
export type AlertModalOptions = {
    message?: ReactNode | ReactNode[];
    closeButtonContent?: ReactNode;
} & ModalOptions;
export type ConfirmModalOptions = {
    message?: ReactNode | ReactNode[];
    confirmButtonContent?: ReactNode;
    cancelButtonContent?: ReactNode;
} & ModalOptions;
export type PromptModalOptions = {
    message?: ReactNode | ReactNode[];
    defaultValue?: string;
    placeholder?: string;
    confirmButtonContent?: ReactNode;
    cancelButtonContent?: ReactNode;
} & ModalOptions;

export const modal = {
    custom: <T = any>(
        content: (close: (result?: T) => Promise<void>) => ReactNode
    ): Promise<T | undefined> => {
        const CustomModal = NiceModal.create(({content, resolve}: CustomModalProps) => {
            const modal = useModal();
            const handleClose = async (result?: any) => {
                resolve?.(result);
                modal.remove();
            };
            const handler = (e: Event) => {
                const target = e.target as HTMLElement;
                if (target.closest("[data-radix-dialog-close]")) {
                    e.stopPropagation();
                }
            };
            useEffect(() => {
                document.addEventListener("click", handler, true);
                return () => {
                    document.removeEventListener("click", handler, true);
                };
            }, []);
            return (
                <Dialog open={modal.visible} onOpenChange={(v) => !v && handleClose()}>
                    {content(handleClose)}
                </Dialog>
            );
        });
        return new Promise(async (resolve) => {
            await NiceModal.show(CustomModal, {content, resolve});
        });
    },
    alert: (options: AlertModalOptions) => {
        return modal.custom<null>((close) => {
            return <DialogContent showCloseButton={options.hasCloseButton ?? true}>
                <DialogHeader>
                    <DialogTitle className={"flex flex-row items-center gap-2"}>
                        {(options.showTitleIcon ?? true) && (options.titleIcon || <AlertCircle className={"h-5 w-5"}/>)}
                        {options.title || "Alert"}
                    </DialogTitle>
                </DialogHeader>
                <div className={"flex flex-col gap-3 items-center"}>
                    <div>{options.message}</div>
                    <DialogClose asChild>
                        {options.closeButtonContent || <Button variant={"default"}>Close</Button>}
                    </DialogClose>
                </div>
            </DialogContent>
        })
    },
    confirm: (options: ConfirmModalOptions) => {
        return modal.custom<boolean>((close) => {
            return <DialogContent showCloseButton={options.hasCloseButton ?? true}>
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
            </DialogContent>
        })
    },
    prompt: (options: PromptModalOptions) => {
        return modal.custom<string | null>((close) => {
            const [inputValue, setInputValue] = React.useState<string>(options.defaultValue || "");
            return <DialogContent showCloseButton={options.hasCloseButton ?? true}>
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
            </DialogContent>
        })
    }
};
