import { BrandText } from "@/components/shared/BrandText";

export default function Footer() {
  return (
    <footer className="bg-bridge-text text-white/70 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-base">
        <div>
          <h4 className="text-white font-semibold mb-3 text-lg">千殊（杭州）教育咨询有限公司</h4>
          <p className="mt-1">浙江省杭州市拱墅区武林街道二圣庙前58号3幢1044室</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-lg">联系方式</h4>
          <p className="mt-1">小助理微信：<span className="text-white font-mono">TrillionSage</span></p>
          <p className="mt-1">
            微信公众号：<BrandText className="text-white">桥梁计划Bridge</BrandText>
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-lg">友情链接</h4>
          <p>
            <BrandText className="text-white/80">桥梁计划</BrandText> · 数理线上营
          </p>
          <p className="mt-1">数理素质测评系统</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-white/15 text-center text-sm text-white/40">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <BrandText className="text-white/50">千殊教育</BrandText> TrillionSage Education. All rights reserved.
        </p>
        <p className="mt-1">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
            浙ICP备2026034285号
          </a>
        </p>
      </div>
    </footer>
  );
}
