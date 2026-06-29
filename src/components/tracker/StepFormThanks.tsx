"use client";

interface StepFormThanksProps {
  visitorName?: string;
  packageName?: string;
  staffName?: string;
}

export default function StepFormThanks({ visitorName, packageName, staffName }: StepFormThanksProps) {
  return (
    <div className="space-y-5 text-center py-4">
      {/* 顶部动画标记 */}
      <div className="text-4xl animate-bounce">🎉</div>

      <div>
        <h3 className="text-lg font-bold text-bridge-blue font-serif mb-2">
          服务流程已全部完成
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          感谢您选择「桥梁计划」，祝{visitorName ? ` ${visitorName} ` : "您"}
          在未来学业路上找到方向、一路顺利。
        </p>
      </div>

      {/* 流程完成卡片 */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
        <p className="text-xs text-green-700 font-semibold mb-1">已完成服务</p>
        <p className="text-xs text-green-600">
          套餐：{packageName || "—"}
        </p>
        <p className="text-xs text-green-600">
          引导员：{staffName || "桥梁计划团队"}
        </p>
        <p className="text-xs text-green-600 mt-1">
          完成时间：{new Date().toLocaleString("zh-CN", { hour12: false })}
        </p>
      </div>

      {/* 操作建议 */}
      <div className="bg-bridge-blue/5 border border-bridge-blue/20 rounded-xl p-4 text-left">
        <p className="text-xs text-bridge-blue font-semibold mb-2">温馨提示</p>
        <ul className="text-xs text-slate-600 space-y-1">
          <li>· 如有任何后续问题，请联系引导员</li>
          <li>· 测验结果可在「数理素质测验」页面重新访问</li>
          <li>· 如需续费或推荐朋友，可联系 13360455457</li>
        </ul>
      </div>
    </div>
  );
}