export default function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-xl md:text-2xl font-bold text-bridge-blue tracking-wide font-sans">
        {title}
      </h2>
      <hr className="w-32 mx-auto mt-4 border-0 h-0.5 bg-gradient-to-r from-transparent via-bridge-gold to-transparent" />
      {subtitle && (
        <p className="mt-4 text-bridge-muted max-w-2xl mx-auto leading-relaxed text-base font-sans whitespace-pre-line">
          {subtitle}
        </p>
      )}
    </div>
  );
}
