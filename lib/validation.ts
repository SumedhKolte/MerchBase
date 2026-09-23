import type { ProductInput } from "@/types/product";

/** Raw form state: inputs always hold strings until validated. */
export type ProductFormValues = Record<keyof ProductInput, string>;
export type ProductFormErrors = Partial<Record<keyof ProductInput, string>>;

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

export function validateProductForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};
  const title = values.title.trim();
  const price = Number(values.price);
  const description = values.description.trim();

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Keep it under ${MAX_TITLE_LENGTH} characters.`;
  }

  if (!values.price.trim() || !Number.isFinite(price) || price <= 0) {
    errors.price = "Enter a price greater than 0.";
  }

  if (!/^\d+$/.test(values.stock.trim())) {
    errors.stock = "Stock must be a whole number (0 or more).";
  }

  if (!values.category) errors.category = "Choose a category.";

  if (!description) errors.description = "Description is required.";
  else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Keep it under ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  return errors;
}

/** Converts validated form strings into the typed API payload. */
export function toProductInput(values: ProductFormValues): ProductInput {
  return {
    title: values.title.trim(),
    price: Math.round(Number(values.price) * 100) / 100,
    stock: Number(values.stock),
    category: values.category,
    description: values.description.trim(),
  };
}
