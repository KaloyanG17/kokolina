import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] items-center px-4 pt-24 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6">
        <p className="caption-3 uppercase tracking-widest text-muted">Page not found</p>
        <h1 className="heading-3 md:heading-1 text-hero-gradient max-w-[680px]">
          This piece is
          <br />
          no longer here
        </h1>
        <p className="body-3 max-w-md text-muted">
          The link may be old, or the page has moved. The current collection is one click away.
        </p>
        <Link href="/shop" className="btn-primary">
          Shop the collection
        </Link>
      </div>
    </section>
  );
}
