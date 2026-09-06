export default function SectionGroupTitle({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={`py-10 px-6 text-center ${className}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-bridge-blue tracking-wide font-brand">
        {title}
      </h2>
      <hr className="w-24 mx-auto mt-4 border-0 h-0.5 bg-gradient-to-r from-transparent via-bridge-gold to-transparent" />
    </div>
  );
}
