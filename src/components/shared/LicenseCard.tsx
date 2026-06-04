import Image from "next/image";

export default function LicenseCard({ imageSrc = "/images/license.jpg" }: { imageSrc?: string }) {
  return (
    <div className="relative inline-block rounded-xl overflow-hidden border border-white/20 shadow-2xl">
      {/* 水印层 */}
      <div
        className="absolute inset-0 z-10 pointer-events-none select-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-30deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 8px), repeating-linear-gradient(60deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 8px)",
        }}
      />
      <div className="absolute inset-0 z-20 pointer-events-none select-none flex items-center justify-center">
        <p
          className="text-red-500/25 font-bold tracking-widest whitespace-nowrap"
          style={{
            transform: "rotate(-25deg) scale(1.8)",
            textShadow: "0 0 8px rgba(255,255,255,0.5)",
            fontSize: "clamp(14px, 4vw, 28px)",
          }}
        >
          仅供网站使用
        </p>
      </div>

      {/* 营业执照图片 */}
      <div className="relative w-full max-w-[700px] h-[500px]">
        <Image
          src={imageSrc}
          alt="营业执照"
          fill
          className="object-contain z-0"
        />
      </div>
    </div>
  );
}
