
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  loading?: boolean;
  wide?: boolean;
}

export function ModalForm({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "Save",
  loading = false,
  wide = false,
}: ModalFormProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={cn("rounded-2xl p-0 gap-0 overflow-hidden", wide ? "max-w-3xl" : "max-w-lg")} showCloseButton={false}>
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
            <DialogDescription className="sr-only">Form to {title.toLowerCase()}</DialogDescription>
          </div>
          <DialogClose asChild className="absolute right-4 top-4">
            <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {onSubmit && (
            <Button onClick={onSubmit} disabled={loading}>
              {loading ? "Saving..." : submitLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
