import type { GarmentKind, Wash } from "@/components/product-art";

/**
 * TEST CATALOGUE. Names, prices and descriptions below are sample data so the
 * shop can be clicked through. Replace them with the real collection before launch.
 */

export const categories = [
  "All",
  "Jeans",
  "Jackets",
  "Shirts",
  "Dresses",
  "Skirts",
  "Overalls",
  "Sweats",
] as const;

export type Category = Exclude<(typeof categories)[number], "All">;

export type Product = {
  slug: string;
  /** Short production number shown on tags, e.g. "Lot 014". */
  lot: string;
  name: string;
  category: Category;
  /** Price in whole euros. */
  price: number;
  colour: string;
  fabric: string;
  description: string;
  fit: string;
  care: string;
  sizes: string[];
  art: GarmentKind;
  wash: Wash;
  /** Optional real photo; the engraved drawing is shown until one is added. */
  image?: string;
  isNew?: boolean;
  soldOut?: boolean;
};

const WAIST = ["26", "28", "30", "32", "34", "36"];
const LETTER = ["XS", "S", "M", "L", "XL"];

export const products: Product[] = [
  {
    slug: "selvedge-straight-jean",
    lot: "Lot 001",
    name: "Selvedge straight jean",
    category: "Jeans",
    price: 189,
    colour: "Raw indigo",
    fabric: "14 oz selvedge denim",
    description:
      "Our core jean. A mid rise, straight leg cut in unwashed selvedge that fades to your own creases over months of wear. Chain stitched hem and copper rivets.",
    fit: "Raw denim stretches about one size at the waist. Take your true waist or one size down.",
    care: "Wear for six months before the first soak. Wash inside out, cold, and hang to dry.",
    sizes: WAIST,
    art: "jeans",
    wash: "raw",
    isNew: true,
  },
  {
    slug: "wide-leg-jean-rinse",
    lot: "Lot 002",
    name: "Wide leg jean",
    category: "Jeans",
    price: 205,
    colour: "One wash",
    fabric: "13 oz selvedge denim",
    description:
      "High rise and a full, wide leg that falls straight from the hip. Rinsed once so it is soft from day one and will not shrink further.",
    fit: "High rise. True to waist size.",
    care: "Machine wash cold, inside out. Line dry.",
    sizes: WAIST,
    art: "jeans",
    wash: "rinse",
    isNew: true,
  },
  {
    slug: "tapered-jean-stone",
    lot: "Lot 003",
    name: "Tapered jean",
    category: "Jeans",
    price: 175,
    colour: "Light stone",
    fabric: "12 oz denim",
    description:
      "Roomy through the thigh and narrowing to the ankle. Stone washed by hand for a worn in, sun faded blue.",
    fit: "Relaxed top block. True to waist size.",
    care: "Machine wash cold. Line dry.",
    sizes: WAIST,
    art: "jeans",
    wash: "light",
  },
  {
    slug: "selvedge-trucker-jacket",
    lot: "Lot 010",
    name: "Selvedge trucker jacket",
    category: "Jackets",
    price: 265,
    colour: "Raw indigo",
    fabric: "14 oz selvedge denim",
    description:
      "A short, boxy jacket with pleated fronts, flap chest pockets and adjuster tabs at the waist. Made from the same cloth as our straight jean.",
    fit: "Cropped and boxy. True to size, or size up to layer over knitwear.",
    care: "Wash rarely, cold and inside out. Hang to dry.",
    sizes: LETTER,
    art: "trucker",
    wash: "raw",
    isNew: true,
  },
  {
    slug: "denim-chore-coat",
    lot: "Lot 011",
    name: "Denim chore coat",
    category: "Jackets",
    price: 295,
    colour: "Ecru",
    fabric: "12 oz undyed denim",
    description:
      "A workwear coat in natural, undyed denim with three patch pockets and corozo buttons. Softens and yellows slightly with age.",
    fit: "Loose. Size down for a closer fit.",
    care: "Machine wash at 30 degrees. Line dry.",
    sizes: LETTER,
    art: "chore",
    wash: "ecru",
  },
  {
    slug: "lined-trucker-jacket",
    lot: "Lot 012",
    name: "Lined trucker jacket",
    category: "Jackets",
    price: 345,
    colour: "One wash",
    fabric: "14 oz denim, wool flannel lining",
    description:
      "Our trucker lined in a checked wool flannel for colder months. Rinsed once and finished with copper shank buttons.",
    fit: "Boxy. Size up to wear over a sweat.",
    care: "Dry clean recommended.",
    sizes: LETTER,
    art: "trucker",
    wash: "rinse",
    soldOut: true,
  },
  {
    slug: "western-denim-shirt",
    lot: "Lot 020",
    name: "Western denim shirt",
    category: "Shirts",
    price: 145,
    colour: "Light wash",
    fabric: "8 oz denim",
    description:
      "Pointed yokes, snap flap pockets and long three snap cuffs. Light enough to wear as a shirt, sturdy enough for an overshirt.",
    fit: "Regular. True to size.",
    care: "Machine wash cold. Line dry.",
    sizes: LETTER,
    art: "western",
    wash: "light",
  },
  {
    slug: "chambray-work-shirt",
    lot: "Lot 021",
    name: "Chambray work shirt",
    category: "Shirts",
    price: 119,
    colour: "Indigo chambray",
    fabric: "5 oz chambray",
    description:
      "A breathable shirt woven with indigo and white yarns. Pointed yokes and pearl snaps, cut for summer.",
    fit: "Slightly relaxed. True to size.",
    care: "Machine wash cold. Iron while damp.",
    sizes: LETTER,
    art: "western",
    wash: "rinse",
    isNew: true,
  },
  {
    slug: "denim-shirt-dress",
    lot: "Lot 030",
    name: "Denim shirt dress",
    category: "Dresses",
    price: 225,
    colour: "Light wash",
    fabric: "8 oz denim",
    description:
      "A belted shirt dress that buttons to the hem. Chest pocket, short sleeves and a skirt with enough room to walk freely.",
    fit: "Relaxed with a self belt. True to size.",
    care: "Machine wash cold. Line dry.",
    sizes: ["XS", "S", "M", "L"],
    art: "dress",
    wash: "light",
  },
  {
    slug: "button-front-midi-skirt",
    lot: "Lot 031",
    name: "Button front midi skirt",
    category: "Skirts",
    price: 159,
    colour: "Raw indigo",
    fabric: "12 oz denim",
    description:
      "An A line midi with copper buttons from waist to hem. Leave the lower buttons open for a slit.",
    fit: "High waisted. True to waist size.",
    care: "Wash cold, inside out. Line dry.",
    sizes: WAIST.slice(0, 5),
    art: "skirt",
    wash: "raw",
  },
  {
    slug: "selvedge-overalls",
    lot: "Lot 040",
    name: "Selvedge overalls",
    category: "Overalls",
    price: 245,
    colour: "One wash",
    fabric: "12 oz selvedge denim",
    description:
      "Classic bib overalls with adjustable straps, a bib pocket and side button openings. Cut wide and comfortable.",
    fit: "Generous. Size down if between sizes.",
    care: "Machine wash cold. Line dry.",
    sizes: LETTER,
    art: "overalls",
    wash: "rinse",
  },
  {
    slug: "indigo-loopback-sweat",
    lot: "Lot 050",
    name: "Indigo loopback sweat",
    category: "Sweats",
    price: 135,
    colour: "Rope dyed indigo",
    fabric: "Loopback cotton",
    description:
      "A heavy crew neck sweat knit on slow loopback machines and dyed with indigo, so it fades just like your jeans.",
    fit: "Relaxed. True to size.",
    care: "Wash cold with darks. Dry flat.",
    sizes: LETTER,
    art: "sweat",
    wash: "rinse",
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelated(product: Product, count = 3) {
  const same = products.filter((p) => p.slug !== product.slug && p.category === product.category);
  const others = products.filter((p) => p.slug !== product.slug && p.category !== product.category);
  return [...same, ...others].slice(0, count);
}
