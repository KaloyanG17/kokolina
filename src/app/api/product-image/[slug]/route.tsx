import { ImageResponse } from "next/og";
import { svgToString } from "@/lib/svg-string";
import { getProduct } from "@/lib/catalog";
import { Patterns, ProductArt } from "@/components/product-art";

/**
 * PNG picture of a product for places that cannot run our SVG drawings:
 * Stripe Checkout, order emails. Uses the first uploaded photo when there is
 * one, otherwise renders the engraved garment drawing.
 */

export const revalidate = 3600;

// Plain colour values for the CSS variables and classes the drawings use
const COLORS: Record<string, string> = {
  "var(--color-thread)": "#d68a2e",
  "var(--color-copper)": "#b8733a",
  "var(--color-base)": "#f3efe6",
  "var(--color-indigo-deep)": "#16213e",
};

function drawingSvg(markup: string) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 300 400" color="#23366e">
<style>.paper,.fill-base{fill:#f3efe6}.fill-indigo{fill:#23366e}.stroke-base{stroke:#f3efe6}</style>
<rect width="300" height="400" fill="#f3efe6"/>${markup}</svg>`;
  for (const [variable, hex] of Object.entries(COLORS)) svg = svg.split(variable).join(hex);
  return svg;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) return new Response("Not found", { status: 404 });

  const photo = product.images?.[0]?.url;
  if (photo) return Response.redirect(photo, 302);

  const markup = svgToString(
    <>
      <defs>
        <Patterns prefix="eng" lineOpacity={0.13} />
      </defs>
      <ProductArt kind={product.art} wash={product.wash} id={`png-${product.slug}`} label={product.name} />
    </>,
  );
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(drawingSvg(markup)).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f3efe6" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} width={600} height={800} alt="" />
      </div>
    ),
    {
      width: 600,
      height: 800,
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}
