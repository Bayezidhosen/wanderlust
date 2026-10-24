"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "wanderlast-packages";

const CATEGORIES = [
  { value: "beach", label: "Beach" },
  { value: "mountains", label: "Mountains" },
  { value: "adventure", label: "Adventure" },
  { value: "city", label: "City Tours" },
  { value: "cultural", label: "Cultural" },
  { value: "wildlife", label: "Wildlife" },
  { value: "cruise", label: "Cruise" },
] as const;

type FormValues = {
  name: string;
  country: string;
  category: string;
  price: string;
  duration: string;
  departureDate: string;
  imageUrl: string;
  description: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL_VALUES: FormValues = {
  name: "",
  country: "",
  category: "",
  price: "",
  duration: "",
  departureDate: "",
  imageUrl: "",
  description: "",
};

type TravelPackage = FormValues & {
  id: string;
  createdAt: string;
};

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) errors.name = "Destination name is required.";
  if (!values.country.trim()) errors.country = "Country is required.";
  if (!values.category) errors.category = "Please select a category.";

  if (!values.price.trim()) {
    errors.price = "Price is required.";
  } else if (Number(values.price) <= 0 || Number.isNaN(Number(values.price))) {
    errors.price = "Price must be a positive number.";
  }

  if (!values.duration.trim()) errors.duration = "Duration is required.";
  if (!values.departureDate)
    errors.departureDate = "Departure date is required.";

  if (values.imageUrl.trim() && !/^https?:\/\/\S+$/i.test(values.imageUrl)) {
    errors.imageUrl = "Please enter a valid URL (starting with http/https).";
  }

  return errors;
}

function savePackage(pkg: TravelPackage) {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const packages = stored ? (JSON.parse(stored) as TravelPackage[]) : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...packages, pkg]));
  } catch {
    // Storage unavailable (private mode etc.) — still treat the submission as done.
  }
}

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClassName = "h-11 w-full bg-muted/50";

export default function AddDestinationPage() {
  const router = useRouter();
  const [values, setValues] = React.useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const setField =
    (field: keyof FormValues) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleCategoryChange = (value: string | null) => {
    setValues((prev) => ({ ...prev, category: value ?? "" }));
    setErrors((prev) => ({ ...prev, category: undefined }));
  };

  const resetForm = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    // Validate first — never send invalid data to the API.
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:8000/add-destination", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, price: Number(values.price) }),
      });

      const data = await res.json().catch(() => null);
      console.log(data);

      if (!res.ok) {
        throw new Error(
          data?.message ?? `Request failed with status ${res.status}.`,
        );
      }

      const pkg: TravelPackage = {
        ...values,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toISOString(),
      };

      savePackage(pkg);
      toast.add({
        title: "Travel package added",
        description: `"${pkg.name}" is now available.`,
        type: "success",
      });
      resetForm();
      router.push("/");
    } catch (error) {
      // Fetch failure (offline, server down, bad response) or non-2xx response.
      console.error(error);
      toast.add({
        title: "Couldn't add the travel package",
        description:
          error instanceof Error && error.message
            ? error.message
            : "The server is unreachable. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    router.push("/");
  };

  return (
    <main className="px-6 py-12 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="font-display text-4xl tracking-tight lg:text-5xl">
          Add New Travel Package
        </h1>

        <Card
          className="mx-auto mt-10 max-w-2xl shadow-sm [--card-spacing:--spacing(6)]"
        >
          <CardContent>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="grid items-start gap-5 md:grid-cols-2"
            >
              <Field
                id="destination-name"
                label="Destination Name"
                error={errors.name}
                className="md:col-span-2"
              >
                <Input
                  id="destination-name"
                  name="name"
                  placeholder="Bali Paradise"
                  value={values.name}
                  onChange={setField("name")}
                  aria-invalid={Boolean(errors.name)}
                  className={inputClassName}
                />
              </Field>

              <Field id="country" label="Country" error={errors.country}>
                <Input
                  id="country"
                  name="country"
                  placeholder="Indonesia"
                  value={values.country}
                  onChange={setField("country")}
                  aria-invalid={Boolean(errors.country)}
                  className={inputClassName}
                />
              </Field>

              <Field id="category" label="Category" error={errors.category}>
                <Select
                  value={values.category || null}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger
                    id="category"
                    name="category"
                    aria-invalid={Boolean(errors.category)}
                    className="h-11 w-full bg-muted/50"
                  >
                    <SelectValue placeholder="Beach" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field id="price" label="Price (USD)" error={errors.price}>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  placeholder="e.g., 1299"
                  value={values.price}
                  onChange={setField("price")}
                  aria-invalid={Boolean(errors.price)}
                  className={inputClassName}
                />
              </Field>

              <Field id="duration" label="Duration" error={errors.duration}>
                <Input
                  id="duration"
                  name="duration"
                  placeholder="e.g., 7 Days/6 Nights"
                  value={values.duration}
                  onChange={setField("duration")}
                  aria-invalid={Boolean(errors.duration)}
                  className={inputClassName}
                />
              </Field>

              <Field
                id="departure-date"
                label="Departure Date"
                error={errors.departureDate}
                className="md:col-span-2"
              >
                <Input
                  id="departure-date"
                  name="departureDate"
                  type="date"
                  value={values.departureDate}
                  onChange={setField("departureDate")}
                  aria-invalid={Boolean(errors.departureDate)}
                  className={inputClassName}
                />
              </Field>

              <Field
                id="image-url"
                label="Image URL"
                error={errors.imageUrl}
                className="md:col-span-2"
              >
                <Input
                  id="image-url"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={values.imageUrl}
                  onChange={setField("imageUrl")}
                  aria-invalid={Boolean(errors.imageUrl)}
                  className={inputClassName}
                />
              </Field>

              <Field
                id="description"
                label="Description"
                error={errors.description}
                className="md:col-span-2"
              >
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the travel experience..."
                  value={values.description}
                  onChange={setField("description")}
                  aria-invalid={Boolean(errors.description)}
                  className="min-h-24 w-full bg-muted/50"
                />
              </Field>

              <div className="flex items-center justify-end gap-3 md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2Icon data-icon="inline-start" />
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1ba8bc] text-white hover:bg-[#179cb0]"
                >
                  {isSubmitting ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <PlusIcon data-icon="inline-start" />
                  )}
                  {isSubmitting ? "Adding..." : "Add Travel Package"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
