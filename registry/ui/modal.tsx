"use client";

import {ReactNode} from "react";
import NiceModal, {useModal} from "@ebay/nice-modal-react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

type CustomModalProps = {
    content: ReactNode;
    title?: string;
    showClose?: boolean;
};

const CustomModal = NiceModal.create(({content, title, showClose = true}: CustomModalProps) => {
    const modal = useModal();
    return (
        <Dialog open={modal.visible} onOpenChange={(v) => !v && modal.hide()}>
            <DialogContent className="sm:max-w-md">
                {title && (
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                )}

                <div className="py-2">{content}</div>

                {showClose && (
                    <DialogFooter>
                        <Button variant="outline" onClick={() => modal.hide()}>
                            关闭
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
});

export default CustomModal;

// 工具函数封装
export function showCustomModal(
    content: ReactNode,
    options?: { title?: string; showClose?: boolean }
) {
    return NiceModal.show(CustomModal, {content, ...options});
}
