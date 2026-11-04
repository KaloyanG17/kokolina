import { Fragment, isValidElement, type ReactNode } from "react";

/**
 * Turns a tree of plain SVG elements and function components into an SVG
 * string, for server code where react-dom/server is not allowed (route
 * handlers). Handles only what the engraved drawings use: no hooks, no
 * context, no event handlers.
 */

// SVG attributes whose React and SVG names are both camelCase
const KEEP_CAMEL = new Set([
  "viewBox",
  "patternUnits",
  "patternTransform",
  "patternContentUnits",
  "preserveAspectRatio",
  "maskUnits",
  "pathLength",
  "gradientUnits",
  "gradientTransform",
]);

const attrName = (name: string) =>
  name === "className" ? "class" : KEEP_CAMEL.has(name) ? name : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function styleString(style: Record<string, string | number>) {
  return Object.entries(style)
    .map(([k, v]) => `${k.startsWith("--") ? k : attrName(k)}:${v}`)
    .join(";");
}

export function svgToString(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return escape(String(node));
  if (Array.isArray(node)) return node.map(svgToString).join("");
  if (!isValidElement(node)) return "";

  const { type } = node;
  const props = (node.props ?? {}) as Record<string, unknown> & { children?: ReactNode };

  if (type === Fragment) return svgToString(props.children);
  if (typeof type === "function") {
    return svgToString((type as (p: typeof props) => ReactNode)(props));
  }
  if (typeof type !== "string") return "";

  const attrs = Object.entries(props)
    .filter(([k, v]) => k !== "children" && k !== "key" && v !== undefined && v !== null && v !== false)
    .map(([k, v]) =>
      k === "style" && typeof v === "object"
        ? `style="${escape(styleString(v as Record<string, string | number>))}"`
        : `${attrName(k)}="${escape(String(v))}"`,
    )
    .join(" ");

  const children = svgToString(props.children);
  return `<${type}${attrs ? ` ${attrs}` : ""}>${children}</${type}>`;
}
