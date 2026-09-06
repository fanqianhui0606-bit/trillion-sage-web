import type { Metadata } from "next";
import SectionTitle from "@/components/shared/SectionTitle";
import ContactInteractive from "@/components/contact/ContactInteractive";

export const metadata: Metadata = {
  title: "联系我们 — 千殊教育",
  description: "千殊教育官方联系方式，添加小助理微信 TrillionSage 开启咨询。",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionTitle
          title="联系我们"
          subtitle="如需咨询请添加千殊小助理微信：TrillionSage"
        />

        <div className="mt-12">
          <ContactInteractive />
        </div>
      </div>
    </div>
  );
}
