import Link from "next/link";
import { ErrorLabel } from "@/components/error-label";
import { getT } from "@/i18n/server";

export default async function NotFound() {
  const { notFound: copy } = await getT();
  return (
    <ErrorLabel code="404" eyebrow={copy.eyebrow} title={copy.title} text={copy.text}>
      <Link href="/shop" className="btn-primary">
        {copy.cta}
      </Link>
      <Link href="/" className="btn-secondary">
        {copy.home}
      </Link>
    </ErrorLabel>
  );
}
