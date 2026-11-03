import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "New product" };

export default function NewProduct() {
  return (
    <>
      <Link href="/admin/products" className="caption-1 focus-ring self-start rounded text-muted hover:text-fg">
        All products
      </Link>
      <PageHeader title="New product" intro="Photos can be added once the product is created." />
      <ProductForm />
    </>
  );
}
