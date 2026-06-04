import type { Metadata } from "next";
import Image from "next/image";
import GlassCard from "@/components/shared/GlassCard";

export const metadata: Metadata = {
  title: "联系我们 — 千殊教育",
  description: "千殊（杭州）教育咨询有限公司联系方式",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* 联系主理人 */}
          <div>
            <h2 className="text-3xl font-bold text-bridge-blue mb-8">联系主理人</h2>
            <div className="space-y-6">
              <GlassCard>
                <h4 className="text-xl font-bold text-bridge-text mb-1">胡桐祎</h4>
                <p className="text-bridge-gold text-sm mb-3">Founder / CEO</p>
                <div className="space-y-2 text-sm text-bridge-muted">
                  <p>电话：133 6045 5457</p>
                  <p>邮箱：huty@trillionSage.com</p>
                </div>
              </GlassCard>
              <GlassCard>
                <h4 className="text-xl font-bold text-bridge-text mb-1">范千慧</h4>
                <p className="text-bridge-gold text-sm mb-3">Co-Founder</p>
                <div className="space-y-2 text-sm text-bridge-muted">
                  <p>电话：188 3515 4290</p>
                  <p>邮箱：fanqh@trillionSage.com</p>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* 关注学术动态 + 公司信息 */}
          <div>
            <h2 className="text-3xl font-bold text-bridge-blue mb-8">关注学术动态</h2>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="aspect-square rounded-xl mb-2 overflow-hidden bg-white/10">
                  <Image
                    src="/images/wechat.jpg"
                    alt="微信公众号二维码"
                    width={300}
                    height={300}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs font-semibold text-bridge-text">微信公众号</p>
              </div>
              <div className="text-center">
                <div className="aspect-square rounded-xl mb-2 overflow-hidden bg-white/10">
                  <Image
                    src="/images/xiaohongshu.jpg"
                    alt="小红书二维码"
                    width={300}
                    height={300}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs font-semibold text-bridge-text">小红书</p>
              </div>
            </div>

            <GlassCard>
              <h3 className="text-lg font-bold text-bridge-blue mb-3">公司信息</h3>
              <div className="space-y-2 text-sm text-bridge-muted">
                <p>千殊（杭州）教育咨询有限公司</p>
                <p>统一社会信用代码：91330105MAK1CN1W0B</p>
                <p>地址：浙江省杭州市拱墅区武林街道二圣庙前58号3幢1044室</p>
                <p>邮箱：contact@trillionsage.com</p>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* 营业执照 */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-bridge-blue mb-6">合规经营 · 信任背书</h3>
          <div className="inline-block rounded-xl overflow-hidden border border-white/20 shadow-2xl">
            <Image
              src="/images/license.png"
              alt="营业执照"
              width={700}
              height={500}
              className="w-full max-w-[700px] h-auto"
              priority
            />
          </div>
          <p className="mt-4 text-bridge-muted text-sm">千殊（杭州）教育咨询有限公司 官方认证</p>
        </div>
      </div>
    </div>
  );
}
