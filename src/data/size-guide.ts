/**
 * Body measurements in centimetres behind the size guide on product pages.
 * These are standard EU charts; change the numbers here if a cut runs differently.
 */

/** Jeans, skirts and other waist sized pieces: size is the waist in inches. */
export const waistChart: Record<string, { waist: string; hip: string }> = {
  "24": { waist: "60–62", hip: "84–86" },
  "25": { waist: "63–64", hip: "87–88" },
  "26": { waist: "65–67", hip: "89–91" },
  "27": { waist: "68–69", hip: "92–93" },
  "28": { waist: "70–72", hip: "94–96" },
  "29": { waist: "73–74", hip: "97–98" },
  "30": { waist: "75–77", hip: "99–101" },
  "31": { waist: "78–79", hip: "102–103" },
  "32": { waist: "80–82", hip: "104–106" },
  "33": { waist: "83–84", hip: "107–108" },
  "34": { waist: "85–87", hip: "109–111" },
  "36": { waist: "90–92", hip: "114–116" },
  "38": { waist: "95–97", hip: "119–121" },
  "40": { waist: "100–102", hip: "124–126" },
};

/** Jackets, shirts, dresses and sweats in letter sizes. */
export const letterChart: Record<string, { chest: string; waist: string; hip: string }> = {
  XXS: { chest: "76–81", waist: "60–65", hip: "82–87" },
  XS: { chest: "82–87", waist: "66–71", hip: "88–93" },
  S: { chest: "88–94", waist: "72–78", hip: "94–100" },
  M: { chest: "95–102", waist: "79–86", hip: "101–107" },
  L: { chest: "103–110", waist: "87–95", hip: "108–114" },
  XL: { chest: "111–118", waist: "96–104", hip: "115–121" },
  XXL: { chest: "119–126", waist: "105–113", hip: "122–128" },
};
