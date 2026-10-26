"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, SaveIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useStoredPackages } from "@/hooks/use-stored-packages";
import { cn } from "@/lib/utils";
import {
  readDeletedSampleIds,
  readStoredPackages,
  type Destination,
  type StoredPackage,
  writeDeletedSampleIds,
  writeStoredPackages,
} from "@/lib/destinations";

const CATEGORIES = [
  { value: "beach", label: "Beach" },
  { value: "mountains", label: "Mountains" },
  { value: "adventure", label: "Adventure" },
  { value: "city", label: "City Tours" },
  { value: "cultural", label: "Cultural" },
  { value: "wildlife", label: "Wildlife" },
  { value: "cruise", label: "Cruise" },
] as const;

type PackageDraft = {
  name: string;
  country: string;
  category: string;
  price: string;
  duration: string;
  departureDate: string;
  imageUrl: string;
  description: string;
};

type FieldErrors = Partial<Record<keyof PackageDraft, string>>;

function toDraft(
  destination: Destination,
  departureDate: string,
): PackageDraft {
  return {
    name: destination.name,
    country: destination.country,
    category: destination.category,
    price: String(destination.price ?? ""),
    duration: destination.duration,
    departureDate,
    imageUrl: destination.imageUrl,
    description: destination.description,
  };
}

/** Same rules as the add-destination form so saved data stays consistent. */
function validate(values: PackageDraft): FieldErrors {
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

/**
 * "Update Travel Package" dialog opened from the destination detail page.
 * Saving upserts the package into localStorage: packages added via
 * /add-destination update in place, while curated samples are saved as a
 * local copy that shadows the sample everywhere. Edits are local-only for
 * now — the backend has no update API yet.
 */
function EditDestination({
  destination,
  departureDate = "",
}: {
  destination: Destination;
  departureDate?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<PackageDraft>(() =>
    toDraft(destination, departureDate),
  );
  const [errors, setErrors] = React.useState<FieldErrors>({});

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    // Re-seed the form from the current package each time it opens so stale
    // values from a previous session are never carried over.
    if (nextOpen) {
      setValues(toDraft(destination, departureDate));
      setErrors({});
    }
  };

  const setField =
    (field: keyof PackageDraft) =>
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const updatedPackage: StoredPackage = {
      id: destination.id,
      createdAt: new Date().toISOString(),
      name: values.name.trim(),
      country: values.country.trim(),
      category: values.category,
      price: Number(values.price),
      duration: values.duration.trim(),
      departureDate: values.departureDate,
      imageUrl: values.imageUrl.trim(),
      description: values.description.trim(),
      rating: destination.rating,
    };

    const packages = readStoredPackages();
    const index = packages.findIndex((pkg) => pkg.id === destination.id);
    if (index >= 0) {
      // Keep the original creation metadata, refresh the rest.
      packages[index] = {
        ...packages[index],
        ...updatedPackage,
        createdAt: packages[index].createdAt,
      };
    } else {
      packages.push(updatedPackage);
    }

    try {
      writeStoredPackages(packages);
    } catch (error) {
      // Storage unavailable (private mode etc.) — still close out the edit.
      console.error(error);
    }

    toast.add({
      title: "Travel package updated",
      description: `"${updatedPackage.name}" has been saved.`,
      type: "success",
    });
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleOpenChange(true)}
      >
        <PencilIcon data-icon="inline-start" />
        Edit
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-5 p-6 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Update Travel Package
            </DialogTitle>
            <DialogDescription>
              Make changes to the travel package details below.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid items-start gap-4 md:grid-cols-2"
          >
            <Field
              id="update-name"
              label="Destination Name"
              error={errors.name}
              className="md:col-span-2"
            >
              <Input
                id="update-name"
                name="name"
                placeholder="Bali Paradise"
                value={values.name}
                onChange={setField("name")}
                aria-invalid={Boolean(errors.name)}
                className={inputClassName}
              />
            </Field>

            <Field id="update-country" label="Country" error={errors.country}>
              <Input
                id="update-country"
                name="country"
                placeholder="Indonesia"
                value={values.country}
                onChange={setField("country")}
                aria-invalid={Boolean(errors.country)}
                className={inputClassName}
              />
            </Field>

            <Field
              id="update-category"
              label="Category"
              error={errors.category}
            >
              <Select
                value={values.category || null}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger
                  id="update-category"
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

            <Field id="update-price" label="Price (USD)" error={errors.price}>
              <Input
                id="update-price"
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

            <Field
              id="update-duration"
              label="Duration"
              error={errors.duration}
            >
              <Input
                id="update-duration"
                name="duration"
                placeholder="e.g., 7 Days/6 Nights"
                value={values.duration}
                onChange={setField("duration")}
                aria-invalid={Boolean(errors.duration)}
                className={inputClassName}
              />
            </Field>

            <Field
              id="update-departure-date"
              label="Departure Date"
              error={errors.departureDate}
              className="md:col-span-2"
            >
              <Input
                id="update-departure-date"
                name="departureDate"
                type="date"
                value={values.departureDate}
                onChange={setField("departureDate")}
                aria-invalid={Boolean(errors.departureDate)}
                className={inputClassName}
              />
            </Field>

            <Field
              id="update-image-url"
              label="Image URL"
              error={errors.imageUrl}
              className="md:col-span-2"
            >
              <Input
                id="update-image-url"
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
              id="update-description"
              label="Description"
              error={errors.description}
              className="md:col-span-2"
            >
              <Textarea
                id="update-description"
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
                onClick={() => setOpen(false)}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2Icon data-icon="inline-start" />
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-[#1ba8bc] text-white hover:bg-[#179cb0]"
              >
                <SaveIcon data-icon="inline-start" />
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * "Delete" action for the destination detail page. User-owned packages are
 * removed from localStorage; curated samples can't be removed from the
 * bundle, so they are tombstoned locally and hidden from every listing.
 */
function DeleteDestination({ destination }: { destination: Destination }) {
  const router = useRouter();
  const storedPackages = useStoredPackages();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const isUserOwned = storedPackages.some((pkg) => pkg.id === destination.id);

  const handleDelete = () => {
    try {
      if (isUserOwned) {
        writeStoredPackages(
          readStoredPackages().filter((pkg) => pkg.id !== destination.id),
        );
      } else {
        writeDeletedSampleIds(
          Array.from(new Set([...readDeletedSampleIds(), destination.id])),
        );
      }
    } catch (error) {
      // Storage unavailable (private mode etc.) — still treat it as done.
      console.error(error);
    }

    toast.add({
      title: "Travel package deleted",
      description: `"${destination.name}" has been removed.`,
      type: "success",
    });
    router.push("/destinations");
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2Icon data-icon="inline-start" />
        Delete
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Delete Travel Package?
            </DialogTitle>
            <DialogDescription>
              This will permanently remove “{destination.name}”. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/85"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { DeleteDestination };
export default EditDestination;
