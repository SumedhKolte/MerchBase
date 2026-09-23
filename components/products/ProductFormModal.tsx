"use client";

import { useId, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { errorId, Field, inputClasses } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/context/ToastContext";
import { useProductMutations } from "@/hooks/useProductMutations";
import { formatCategory, formatCurrency } from "@/lib/format";
import {
  toProductInput,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/lib/validation";
import { getErrorMessage } from "@/services/api";
import type { Category, Product } from "@/types/product";
import { MutationBadge, StockBadge } from "./ProductBadges";
import { ProductThumbnail } from "./ProductThumbnail";

interface ProductFormModalProps {
  /** `null` opens the form in "add" mode. */
  product: Product | null;
  categories: Category[];
  onClose: () => void;
}

function toFormValues(product: Product | null): ProductFormValues {
  return {
    title: product?.title ?? "",
    price: product ? String(product.price) : "",
    stock: product ? String(product.stock) : "",
    category: product?.category ?? "",
    description: product?.description ?? "",
  };
}

/** Shows how the row will look, updating as the user types. */
function LivePreview({ values, product }: { values: ProductFormValues; product: Product | null }) {
  const price = Number(values.price);
  const stock = Number(values.stock);

  return (
    <section
      aria-label="Live preview"
      className="rounded-xl border border-dashed border-line-strong bg-surface-muted/50 p-3"
    >
      <p className="mb-2 text-xs font-medium tracking-wide text-fg-subtle uppercase">Preview</p>
      <div className="flex gap-3 rounded-lg border border-line bg-surface p-3 shadow-xs">
        <ProductThumbnail src={product?.thumbnail ?? ""} alt="" size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{values.title.trim() || "Untitled product"}</p>
          <p className="truncate text-xs text-fg-subtle">
            {values.category ? formatCategory(values.category) : "No category"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold tabular-nums">
              {Number.isFinite(price) && price > 0 ? formatCurrency(price) : "$—"}
            </span>
            {/^\d+$/.test(values.stock.trim()) && <StockBadge stock={stock} />}
            <MutationBadge status={product ? "modified" : "draft"} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductFormModal({ product, categories, onClose }: ProductFormModalProps) {
  const { createProduct, editProduct } = useProductMutations();
  const showToast = useToast();
  const formId = useId();
  const [values, setValues] = useState(() => toFormValues(product));
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = product !== null;

  const fieldProps = (field: keyof ProductFormValues) => ({
    id: `product-${field}`,
    name: field,
    value: values[field],
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? errorId(`product-${field}`) : undefined,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateProductForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const input = toProductInput(values);
      if (isEditing) await editProduct(product.id, input);
      else await createProduct(input);
      showToast(isEditing ? "Changes saved to this session" : "Product added as a local draft");
      onClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      variant="sheet"
      title={isEditing ? "Edit product" : "Add product"}
      description="DummyJSON doesn't persist writes, so changes are kept for this browser session."
      onClose={onClose}
      isDismissible={!isSubmitting}
      footer={
        <>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {/* Lives outside the <form> (in the pinned footer), so it targets it by id. */}
          <Button type="submit" form={formId} variant="primary" isLoading={isSubmitting}>
            {isEditing ? "Save changes" : "Add product"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-6">
        <LivePreview values={values} product={product} />

        {submitError && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {submitError}
          </p>
        )}

        <fieldset className="space-y-4">
          <legend className="mb-3 text-sm font-semibold">Basic details</legend>
          <Field id="product-title" label="Title" error={errors.title}>
            <input
              {...fieldProps("title")}
              className={inputClasses(Boolean(errors.title))}
              autoFocus
              maxLength={100}
            />
          </Field>
          <Field id="product-category" label="Category" error={errors.category}>
            <Select {...fieldProps("category")} hasError={Boolean(errors.category)}>
              <option value="" disabled>
                Select a category
              </option>
              {categories.map(({ slug, name }) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="product-description" label="Description" error={errors.description}>
            <textarea
              {...fieldProps("description")}
              className={inputClasses(Boolean(errors.description))}
              rows={4}
              maxLength={1000}
            />
          </Field>
        </fieldset>

        {/* Divider on a wrapper: a legend would otherwise sit on the fieldset's border. */}
        <div className="border-t border-line pt-5">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Pricing & inventory</legend>
            <div className="grid grid-cols-2 gap-4">
              <Field id="product-price" label="Price (USD)" error={errors.price}>
                <input
                  {...fieldProps("price")}
                  className={inputClasses(Boolean(errors.price))}
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                />
              </Field>
              <Field id="product-stock" label="Stock" error={errors.stock}>
                <input
                  {...fieldProps("stock")}
                  className={inputClasses(Boolean(errors.stock))}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                />
              </Field>
            </div>
          </fieldset>
        </div>
      </form>
    </Modal>
  );
}
