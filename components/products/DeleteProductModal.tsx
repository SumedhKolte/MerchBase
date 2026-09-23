"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { useProductMutations } from "@/hooks/useProductMutations";
import type { Product } from "@/types/product";

interface DeleteProductModalProps {
  /** One product from a row action, or several from the bulk bar. */
  products: Product[];
  onClose: () => void;
  /** Called after every deletion succeeded, e.g. to leave a now-deleted detail page. */
  onDeleted?: () => void;
}

export function DeleteProductModal({ products, onClose, onDeleted }: DeleteProductModalProps) {
  const { removeProduct } = useProductMutations();
  const showToast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const isSingle = products.length === 1;
  const subject = isSingle ? `“${products[0].title}”` : `${products.length} products`;

  const handleDelete = async () => {
    setIsDeleting(true);
    // allSettled: one failed request shouldn't hide the ones that succeeded.
    const results = await Promise.allSettled(products.map((product) => removeProduct(product.id)));
    const failed = results.filter((result) => result.status === "rejected").length;

    onClose();
    if (failed === 0) {
      showToast(`${subject} deleted`);
      onDeleted?.();
    } else {
      showToast(`${failed} of ${products.length} deletions failed`, "error");
    }
  };

  return (
    <Modal
      role="alertdialog"
      title={isSingle ? "Delete product?" : `Delete ${products.length} products?`}
      description={
        <>
          <span className="font-medium text-fg">{subject}</span> will be removed from this session.
          Use “Reset demo changes” to bring {isSingle ? "it" : "them"} back.
        </>
      }
      onClose={onClose}
      isDismissible={!isDeleting}
    >
      <div className="flex justify-end gap-2">
        {/* Focus the safe action first for destructive confirmations. */}
        <Button onClick={onClose} disabled={isDeleting} autoFocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
