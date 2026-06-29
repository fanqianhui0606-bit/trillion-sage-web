"use client";

import { useState } from "react";
import type { TrackerOrder } from "@/lib/tracker-types";
import { PACKAGES } from "@/lib/tracker-packages";
import type { PackageId } from "@/lib/tracker-types";

interface Props {
  data?: TrackerOrder["visitor"];
  readOnly?: boolean;
  onSave?: (data: TrackerOrder["visitor"]) => void;
}

/** A 阶段：来访者信息表单 */
export default function StepFormAIntake({ data, readOnly = false, onSave }: Props) {
  const [form, setForm] = useState<TrackerOrder["visitor"]>({
    name: data?.name || "",
    age: data?.age || "",
    grade: data?.grade || "",
    school: data?.school || "",
    phone: data?.phone || "",
    wechat: data?.wechat || "",
    email: data?.email || "",
    parentName: data?.parentName || "",
    relationship: data?.relationship || "",
    parentTitle: (data as Record<string, string>)?.parentTitle || "",
    parentPhone: (data as Record<string, string>)?.parentPhone || "",
    ...data,
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("姓名不能为空");
      return;
    }
    onSave?.(form);
  };

  const pkg = PACKAGES[form.packageId as PackageId];
  void pkg; // 避免未使用警告

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-bridge-blue border-b border-white/10 pb-2">
        来访者信息
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-bridge-muted mb-1">姓名 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            placeholder="来访者姓名"
          />
        </div>
        <div>
          <label className="block text-xs text-bridge-muted mb-1">年龄</label>
          <input
            type="text"
            value={form.age}
            onChange={(e) => handleChange("age", e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            placeholder="如 17"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-bridge-muted mb-1">年级</label>
          <input
            type="text"
            value={form.grade}
            onChange={(e) => handleChange("grade", e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            placeholder="如 高三"
          />
        </div>
        <div>
          <label className="block text-xs text-bridge-muted mb-1">就读学校</label>
          <input
            type="text"
            value={form.school}
            onChange={(e) => handleChange("school", e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            placeholder="学校名称"
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
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
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
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
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
          className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
          placeholder="email@example.com"
        />
      </div>

      <div className="border-t border-white/10 pt-4 mt-4">
        <h4 className="text-xs font-bold text-bridge-muted mb-3">家长/监护人信息</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-bridge-muted mb-1">家长姓名</label>
            <input
              type="text"
              value={form.parentName}
              onChange={(e) => handleChange("parentName", e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
              placeholder="如 张爸爸"
            />
          </div>
          <div>
            <label className="block text-xs text-bridge-muted mb-1">称谓</label>
            <select
              value={form.relationship}
              onChange={(e) => handleChange("relationship", e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            >
              <option value="">选择称谓</option>
              <option value="父亲">父亲</option>
              <option value="母亲">母亲</option>
              <option value="爸爸">爸爸</option>
              <option value="妈妈">妈妈</option>
              <option value="其他家长">其他家长</option>
              <option value="监护人">监护人</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs text-bridge-muted mb-1">家长称谓</label>
            <input
              type="text"
              value={(form as Record<string, string>).parentTitle || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, parentTitle: e.target.value }))}
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
              placeholder="如 张爸爸"
            />
          </div>
          <div>
            <label className="block text-xs text-bridge-muted mb-1">家长电话</label>
            <input
              type="tel"
              value={(form as Record<string, string>).parentPhone || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, parentPhone: e.target.value }))}
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
              placeholder="手机号"
            />
          </div>
        </div>
      </div>

      {!readOnly && (
        <button
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-bridge-blue hover:bg-blue-600 transition-colors"
        >
          保存来访信息
        </button>
      )}
    </div>
  );
}