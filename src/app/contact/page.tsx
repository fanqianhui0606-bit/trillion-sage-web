import type { Metadata } from "next";
import SectionTitle from "@/components/shared/SectionTitle";
import ContactInteractive from "@/components/contact/ContactInteractive";

export const metadata: Metadata = {
  title: "联系我们与合规资质 — 千殊教育",
  description: "千殊（杭州）教育咨询有限公司官方联系方式与合规执照核验，开启您的一对一科学导航之旅。",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionTitle
          title="联系我们 · 生涯引航"
          subtitle="通过官方微信、公众号、小红书与我们取得联系，获取一流的高校科研信息及心理服务支持"
        />

        <div className="mt-12">
          <ContactInteractive />
        </div>
      </div>
    </div>
  );
}
