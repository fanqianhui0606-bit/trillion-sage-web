/** @deprecated 首页四大板块请使用 CollapsibleSectionGroup */
export default function SectionGroupTitle({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={`py-10 px-6 text-center ${className}`}>
      <h2 className="text-4xl md:text-5xl font-bold text-bridge-blue tracking-wide font-feiyun">
        {title}
      </h2>
      <hr className="w-24 mx-auto mt-4 border-0 h-0.5 bg-gradient-to-r from-transparent via-bridge-gold to-transparent" />
    </div>
  );
}
