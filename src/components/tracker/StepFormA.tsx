"use client";

import { useState } from "react";
import type { TrackerOrder, PackageId } from "@/lib/tracker-types";
import { PACKAGES, getPackagePrice, getDepositAmount } from "@/lib/tracker-packages";
import { getOrderAgreementRecord, isAgreementAgreed } from "@/lib/tracker-agreements";
import StepAgreementGate from "./StepAgreementGate";

const AGE_OPTIONS = [...Array.from({ length: 12 }, (_, i) => String(14 + i)), "25以上"];
const GRADE_OPTIONS = ["高一学生", "高二学生", "高三学生", "本科生", "其它"];

interface Props {
  data?: TrackerOrder["visitor"];
  order: TrackerOrder;
  packageId?: PackageId;
  role?: "family" | "staff";
  readOnly?: boolean;
  onOpenAgreement: (agreementId: string) => void;
  onSave?: (data: TrackerOrder["visitor"]) => void;
}

function deriveAdult(form: TrackerOrder["visitor"]): boolean {
  return !!(form.isAdult || form.age === "25以上" || form.grade === "本科生" || form.grade?.includes("本科"));
}

/** A 阶段：来访者信息表单（隐私政策绑定在保存按钮上方） */
export default function StepFormAIntake({
  data,
  order,
  packageId,
  role = "family",
  readOnly = false,
  onOpenAgreement,
  onSave,
}: Props) {
  const [form, setForm] = useState<TrackerOrder["visitor"]>({
    name: data?.name || "",
    age: data?.age || "",
    grade: data?.grade || "",
    school: data?.school || "",
    phone: data?.phone || "",
    wechat: data?.wechat || "",
    email: data?.email || "",
    isAdult: data?.isAdult || false,
    parentName: data?.parentName || "",
    relationship: data?.relationship || "",
    parentTitle: data?.parentTitle || "",
    parentPhone: data?.parentPhone || "",
    parentWechat: data?.parentWechat || "",
    parentEmail: data?.parentEmail || "",
    packageId: (data?.packageId as string) || packageId || order.packageId || "1v1",
    ...data,
  });

  const adult = deriveAdult(form);
  const privacyOk = isAgreementAgreed(getOrderAgreementRecord(order, "privacy"));
  const selectedPkg = PACKAGES[form.packageId as PackageId];

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "age" || field === "grade" || field === "isAdult") {
        // 年龄/年级变化时同步成年判定展示
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("姓名不能为空");
      return;
    }
    if (!privacyOk) {
      alert("请先阅读并同意《个人信息收集及隐私政策》");
      return;
    }
    if (!form.packageId) {
      alert("请选择套餐");
      return;
    }
    if (!adult) {
      if (!form.parentName?.trim() || !form.relationship?.trim() || !form.parentPhone?.trim()) {
        alert("未成年来访需填写家长姓名、关系与电话");
        return;
      }
    }
    onSave?.({ ...form, isAdult: adult });
  };

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60";
  const parentDis = readOnly || adult;

  return (
    <div className="space-y-4">
      <p className="text-xs text-bridge-muted leading-relaxed">
        <strong className="text-bridge-text">请填写真实姓名</strong>
        （与证件一致，用于合同与服务档案，不得使用昵称或化名）。
      </p>

      <h3 className="text-base font-bold text-bridge-blue border-b border-white/10 pb-2 text-center">
        一、来访信息
        <span className="ml-2 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
          家庭端
        </span>
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-bridge-muted mb-1">姓名 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={readOnly}
            className={inputCls}
            placeholder="来访者真实姓名"
          />
        </div>
        <div>
          <label className="block text-xs text-bridge-muted mb-1">年龄</label>
          <select
            value={form.age}
            onChange={(e) => handleChange("age", e.target.value)}
            disabled={readOnly}
            className={inputCls}
          >
            <option value="">请选择</option>
            {AGE_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-bridge-muted mb-1">年级</label>
          <select
            value={form.grade}
            onChange={(e) => handleChange("grade", e.target.value)}
            disabled={readOnly}
            className={inputCls}
          >
            <option value="">请选择</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-bridge-muted mb-1">就读学校</label>
          <input
            type="text"
            value={form.school}
            onChange={(e) => handleChange("school", e.target.value)}
            disabled={readOnly}
            className={inputCls}
            placeholder="学校全称"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-bridge-muted mb-1">联系电话</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={readOnly}
            className={inputCls}
            placeholder="手机号"
          />
        </div>
        <div>
          <label className="block text-xs text-bridge-muted mb-1">微信号</label>
          <input
            type="text"
            value={form.wechat}
            onChange={(e) => handleChange("wechat", e.target.value)}
            disabled={readOnly}
            className={inputCls}
            placeholder="微信号"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-bridge-muted mb-1">邮箱</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          disabled={readOnly}
          className={inputCls}
          placeholder="email@example.com"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-bridge-text">
        <input
          type="checkbox"
          checked={!!form.isAdult || form.age === "25以上" || form.grade === "本科生"}
          onChange={(e) => handleChange("isAdult", e.target.checked)}
          disabled={readOnly}
        />
        来访已成年（免填家长信息）
      </label>

      <div className={`border-t border-white/10 pt-4 mt-2 ${adult ? "opacity-55" : ""}`}>
        <h4 className="text-xs font-bold text-bridge-muted mb-3">
          家长/监护人信息
          {adult && <span className="ml-2 font-normal text-bridge-muted">（已成年，无需填写）</span>}
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-bridge-muted mb-1">家长姓名</label>
            <input
              type="text"
              value={form.parentName}
              onChange={(e) => handleChange("parentName", e.target.value)}
              disabled={parentDis}
              className={inputCls}
              placeholder="家长真实姓名"
            />
          </div>
          <div>
            <label className="block text-xs text-bridge-muted mb-1">与来访关系</label>
            <select
              value={form.relationship}
              onChange={(e) => handleChange("relationship", e.target.value)}
              disabled={parentDis}
              className={inputCls}
            >
              <option value="">选择关系</option>
              <option value="父亲">父亲</option>
              <option value="母亲">母亲</option>
              <option value="监护人">监护人</option>
              <option value="其他家长">其他家长</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs text-bridge-muted mb-1">家长称谓</label>
            <select
              value={form.parentTitle || ""}
              onChange={(e) => handleChange("parentTitle", e.target.value)}
              disabled={parentDis}
              className={inputCls}
            >
              <option value="">— 请选择 —</option>
              <option value="女士">女士</option>
              <option value="男士">男士</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-bridge-muted mb-1">家长电话</label>
            <input
              type="tel"
              value={form.parentPhone || ""}
              onChange={(e) => handleChange("parentPhone", e.target.value)}
              disabled={parentDis}
              className={inputCls}
              placeholder="手机号"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <h3 className="text-base font-bold text-bridge-blue mb-3 text-center">
          二、套餐选择
          <span className="ml-2 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
            双方确认
          </span>
        </h3>
        <select
          value={(form.packageId as string) || ""}
          onChange={(e) => handleChange("packageId", e.target.value)}
          disabled={readOnly}
          className={inputCls}
        >
          {Object.values(PACKAGES).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.price != null
                ? ` · ¥${p.price}`
                : ` · ¥${p.priceMin ?? ""}-${p.priceMax ?? ""}`}
            </option>
          ))}
        </select>
        {selectedPkg && (
          <p className="text-xs text-bridge-muted mt-2 leading-relaxed">
            {selectedPkg.description}
            <br />
            合约参考总额：
            <strong className="text-bridge-text">¥{getPackagePrice(selectedPkg.id)}</strong>
            {" · "}定金 10%：
            <strong className="text-bridge-text">¥{getDepositAmount(selectedPkg.id)}</strong>
          </p>
        )}
      </div>

      {/* 隐私政策：绑定在本环节，置于保存按钮上方 */}
      <StepAgreementGate
        stepId="a-visitor-info"
        order={order}
        role={role}
        onOpen={onOpenAgreement}
      />

      {!readOnly && (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg font-bold text-base text-white bg-bridge-blue hover:bg-blue-600 transition-colors"
        >
          保存来访信息
        </button>
      )}
    </div>
  );
}
