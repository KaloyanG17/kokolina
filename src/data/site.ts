/**
 * Everything the designer needs to fill in lives in this file.
 *
 * Any value written as {{like this}} is a placeholder for a real fact
 * (price, press quote, return window, ...). Replace it before launch;
 * none of these should be invented.
 */

export const site = {
  brand: "Kokolina",
  city: "{{city}}",
  url: "https://kokolina.vercel.app", // overridden by NEXT_PUBLIC_SITE_URL
  description:
    "Kokolina cuts selvedge denim and workwear in small numbered runs in {{city}}. Every seam is finished by hand.",
  currency: "EUR",
  locale: "en-IE",
  pressMention: "{{press mention}}",
  shippingDays: "{{shipping days}}",
  returnWindow: "{{return window}}",
  runSize: "{{run size}}",
  mill: "{{mill name}}",
  // Leave null to hide the link in the footer.
  contactEmail: null as string | null,
  instagram: null as string | null,
};


export const faqs = [
  {
    q: "How do I find my size?",
    a: "Every product page has fit notes. If you sit between two sizes, write to us with your height and usual size and we will recommend one.",
  },
  {
    q: "How long does shipping take?",
    a: `Orders leave the studio within ${site.shippingDays}. You get a tracking link by email as soon as the parcel is collected.`,
  },
  {
    q: "Can I return a piece?",
    a: `Yes. Unworn pieces with their tags can be returned within ${site.returnWindow} of delivery for a full refund.`,
  },
  {
    q: "Where are the fabrics from?",
    a: `Our main cloths come from ${site.mill}. Each product page names the fabric and its fibre content.`,
  },
  {
    q: "Why are some pieces made in limited numbers?",
    a: `Each style is cut in runs of ${site.runSize} pieces. When a run sells out, it may come back in a later collection, but we do not promise it.`,
  },
  {
    q: "How should I care for my piece?",
    a: "Care instructions are sewn into every garment. Most tailoring should be dry cleaned and steamed rather than pressed with a hot iron.",
  },
  {
    q: "Do you offer alterations?",
    a: "{{alterations policy}}",
  },
  {
    q: "Which payment methods do you accept?",
    a: "{{payment methods}}",
  },
];

export const testimonials = [
  { quote: "{{testimonial}}", name: "{{customer name}}", detail: "{{city}}" },
  { quote: "{{testimonial}}", name: "{{customer name}}", detail: "{{city}}" },
  { quote: "{{testimonial}}", name: "{{customer name}}", detail: "{{city}}" },
];

export const press = [
  "{{publication}}",
  "{{publication}}",
  "{{publication}}",
  "{{publication}}",
];
