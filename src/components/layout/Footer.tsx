export default function Footer() {
  return (
    <footer className="bg-bridge-text text-white/70 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <h4 className="text-white font-semibold mb-3">千殊（杭州）教育咨询有限公司</h4>
          <p>信用代码：91330108MAE5QFYB3H</p>
          <p className="mt-1">浙江省杭州市西湖区文三路408号</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">联系方式</h4>
          <p>邮箱：contact@trillionsage.com</p>
          <p className="mt-1">微信公众号：千殊教育</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">友情链接</h4>
          <p>桥梁计划 · 数理学术衔接营</p>
          <p className="mt-1">数理素质测评系统</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-white/15 text-center text-xs text-white/40">
        <p>&copy; {new Date().getFullYear()} 千殊教育 TrillionSage Education. All rights reserved.</p>
        <p className="mt-1">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
            浙ICP备2026034285号
          </a>
        </p>
      </div>
    </footer>
  );
}
