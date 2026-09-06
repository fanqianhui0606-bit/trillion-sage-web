import { Fragment, type ReactNode } from "react";

const BRAND_RE = /(桥梁计划|千殊教育)/g;

/** 品牌名专用字体：鸿雷拙书简体 */
export function BrandText({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`font-brand ${className}`}>{children}</span>;
}

/** 将文案中的「桥梁计划」「千殊教育」套上品牌字体 */
export function withBrandFonts(text: string): ReactNode {
  if (!text) return text;
  const parts = text.split(BRAND_RE);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part === "桥梁计划" || part === "千殊教育" ? (
      <BrandText key={`b-${i}`}>{part}</BrandText>
    ) : (
      <Fragment key={`t-${i}`}>{part}</Fragment>
    )
  );
}
