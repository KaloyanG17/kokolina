import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.brand}, selvedge denim cut and stitched in small runs`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#16213e",
          color: "#f3efe6",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 30, color: "#d68a2e" }}>{site.brand}</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 72, fontWeight: 600, lineHeight: 1 }}>
          <span>Raw denim, cut</span>
          <span style={{ color: "#d68a2e" }}>and stitched by hand</span>
        </div>
      </div>
    ),
    size,
  );
}
