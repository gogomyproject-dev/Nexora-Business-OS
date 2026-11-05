import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
// shadcn-style accessible Radix dialog primitive; local styling matches the dashboard.
export function DetailDrawer({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="drawer">
          <div className="drawer-heading">
            <div>
              <span className="eyebrow">READ ONLY · DEMO</span>
              <Dialog.Title>{title}</Dialog.Title>
            </div>
            <Dialog.Close className="icon-button" aria-label="关闭明细">
              <X size={20} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="muted">
            仅展示当前筛选下的模拟数据，不执行审批或修改。
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
