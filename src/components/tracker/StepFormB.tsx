"use client";

import { useState, useEffect } from "react";
import majorsData from "../../../public/data/majors-intro.json";
interface Props {
  type: "consult-pre" | "consult-post" | "quiz" | "counseling";
  consultIndex?: number; // 1, 2, 3
  data?: Record<string, unknown>;
  readOnly?: boolean;
  role?: "staff" | "family";
  onSave?: (data: Record<string, unknown>) => void;
}

// 从 majors-intro.json 动态加载专业列表（理工农医相关门类）
type MajorEntry = { code: string; name: string; category: string };
const STSTEM_CATEGORIES = ["数学类", "物理学类", "化学类", "生物学类", "计算机类", "电子信息类", "自动化类", "机械类", "土木类", "材料类", "医学技术类", "药学类", "统计学类", "心理学类", "力学类", "电气类", "化工类", "建筑类", "环境类", "林学类", "草学类", "水产类", "动物医学类", "植物生产类", "动物生产类"];

interface MajorsJson {
  majors: Record<string, { officialName: string; level2Category: string }>;
}

function loadMajorOptions(): MajorEntry[] {
  try {
    const typedMajorsData = majorsData as unknown as MajorsJson;
    return Object.entries(typedMajorsData.majors)
      .filter(([, m]) => STSTEM_CATEGORIES.includes(m.level2Category))
      .map(([code, m]) => ({ code, name: m.officialName, category: m.level2Category }))
      .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  } catch {
    return [];
  }
}

/** B 阶段咨询表单 */
export default function StepFormB({ type, consultIndex = 1, data, readOnly = false, role = "staff", onSave }: Props) {
  // 咨询事前
  const [preMentor, setPreMentor] = useState((data?.mentor as string) || "");
  const [preMajor, setPreMajor] = useState((data?.major as string) || "");
  const [preDate, setPreDate] = useState((data?.date as string) || "");
  const [preTime, setPreTime] = useState((data?.time as string) || "");
  const [preNote, setPreNote] = useState((data?.note as string) || "");
  const [preQuestions, setPreQuestions] = useState((data?.questions as string) || "");

  // 咨询事后
  const [postDuration, setPostDuration] = useState((data?.duration as string) || "");
  const [postOvertime, setPostOvertime] = useState((data?.overtime as boolean) || false);
  const [postOvertimeFee, setPostOvertimeFee] = useState((data?.overtimeFee as number) || 0);
  const [postOvertimeNo, setPostOvertimeNo] = useState((data?.overtimeNo as string) || "");
  const [postRecording, setPostRecording] = useState((data?.recording as string) || "");
  const [postMessage, setPostMessage] = useState((data?.message as string) || "");

  // 测验（专业列表动态加载）
  const [quizDate, setQuizDate] = useState((data?.date as string) || "");
  const [quizPdfUrl, setQuizPdfUrl] = useState((data?.pdfUrl as string) || "");
  const [quizMajors, setQuizMajors] = useState<string[]>(
    (data?.topMajors as string[]) || ["", "", "", "", ""]
  );
  const [majorOptions, setMajorOptions] = useState<MajorEntry[]>([]);
  useEffect(() => {
    setMajorOptions(loadMajorOptions());
  }, []);

  // 心理辅导
  const [counselDate, setCounselDate] = useState((data?.date as string) || "");
  const [counselTime, setCounselTime] = useState((data?.time as string) || "");
  const [counselDuration, setCounselDuration] = useState((data?.duration as string) || "50分钟");
  const [counselPsychologist, setCounselPsychologist] = useState((data?.psychologist as string) || "");
  const [counselChecked, setCounselChecked] = useState((data?.supervisorChecked as boolean) || false);

  const handleSave = () => {
    let formData: Record<string, unknown> = {};

    switch (type) {
      case "consult-pre":
        formData = {
          consultIndex,
          type: "pre",
          mentor: preMentor,
          major: preMajor,
          date: preDate,
          time: preTime,
          note: preNote,
          questions: preQuestions,
          questionsAt: preQuestions ? new Date().toISOString() : undefined,
        };
        break;
      case "consult-post":
        formData = {
          consultIndex,
          type: "post",
          duration: postDuration,
          overtime: postOvertime,
          overtimeFee: postOvertime ? postOvertimeFee : 0,
          overtimeNo: postOvertime ? postOvertimeNo : "",
          recording: postRecording,
          message: postMessage,
          confirmedAt: new Date().toISOString(),
        };
        break;
      case "quiz":
        formData = {
          date: quizDate,
          pdfUrl: quizPdfUrl,
          topMajors: quizMajors.filter(Boolean),
          completedAt: new Date().toISOString(),
        };
        break;
      case "counseling":
        formData = {
          date: counselDate,
          time: counselTime,
          duration: counselDuration,
          psychologist: counselPsychologist,
          supervisorChecked: counselChecked,
        };
        break;
    }

    onSave?.(formData);
  };

  // ---- 咨询事前表单 ----
  if (type === "consult-pre") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-bridge-blue border-b border-white/10 pb-2">
          咨询{consultIndex} · 事前确认
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-bridge-muted mb-1">咨询专业方向</label>
            <input
              type="text"
              value={preMajor}
              onChange={(e) => setPreMajor(e.target.value)}
              disabled={readOnly || role === "family"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
              placeholder="如 数学方向"
            />
          </div>
          <div>
            <label className="block text-xs text-bridge-muted mb-1">咨询学长/学姐</label>
            <input
              type="text"
              value={preMentor}
              onChange={(e) => setPreMentor(e.target.value)}
              disabled={readOnly || role === "family"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
              placeholder="学长姓名"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-bridge-muted mb-1">预约日期</label>
            <input
              type="date"
              value={preDate}
              onChange={(e) => setPreDate(e.target.value)}
              disabled={readOnly || role === "family"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs text-bridge-muted mb-1">预约时间</label>
            <input
              type="time"
              value={preTime}
              onChange={(e) => setPreTime(e.target.value)}
              disabled={readOnly || role === "family"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-bridge-muted mb-1">沟通备注（引导员填写）</label>
          <textarea
            value={preNote}
            onChange={(e) => setPreNote(e.target.value)}
            disabled={readOnly || role === "family"}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60 resize-none"
            placeholder="备注信息"
          />
        </div>

        <div>
          <label className="block text-xs text-bridge-muted mb-1">咨询问题（家长/学生填写）</label>
          <textarea
            value={preQuestions}
            onChange={(e) => setPreQuestions(e.target.value)}
            disabled={readOnly || role === "staff"}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60 resize-none"
            placeholder="请在此处写下你们想要咨询的问题..."
          />
          <p className="text-[10px] text-bridge-muted mt-1">可提前准备多个问题，以便咨询时高效沟通</p>
        </div>

        {!readOnly && (
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-bridge-blue hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        )}
      </div>
    );
  }

  // ---- 咨询事后表单 ----
  if (type === "consult-post") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-bridge-blue border-b border-white/10 pb-2">
          咨询{consultIndex} · 事后确认
        </h3>

        <div>
          <label className="block text-xs text-bridge-muted mb-1">实际咨询时长</label>
          <select
            value={postDuration}
            onChange={(e) => setPostDuration(e.target.value)}
            disabled={readOnly || role === "family"}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
          >
            <option value="">选择时长</option>
            <option value="40分钟">40分钟（标准课时）</option>
            <option value="40分钟+10分钟">40分钟+10分钟（家长参与）</option>
            <option value="60分钟">60分钟（1.5课时）</option>
            <option value="90分钟">90分钟（加时）</option>
            <option value="120分钟">120分钟（2课时）</option>
          </select>
        </div>

        <div className="p-3 rounded-lg border border-bridge-gold/30 bg-bridge-gold/5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={postOvertime}
              onChange={(e) => setPostOvertime(e.target.checked)}
              disabled={readOnly || role === "family"}
              className="w-4 h-4 accent-bridge-gold"
            />
            <span className="text-sm font-semibold text-bridge-gold">本次咨询有加时</span>
          </label>

          {postOvertime && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-bridge-muted mb-1">加时费</label>
                <input
                  type="number"
                  value={postOvertimeFee}
                  onChange={(e) => setPostOvertimeFee(Number(e.target.value))}
                  disabled={readOnly || role === "family"}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
                  placeholder="¥"
                />
              </div>
              <div>
                <label className="block text-xs text-bridge-muted mb-1">收款单号</label>
                <input
                  type="text"
                  value={postOvertimeNo}
                  onChange={(e) => setPostOvertimeNo(e.target.value)}
                  disabled={readOnly || role === "family"}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
                  placeholder="单号"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-bridge-muted mb-1">录音录像链接（引导员填写）</label>
          <input
            type="url"
            value={postRecording}
            onChange={(e) => setPostRecording(e.target.value)}
            disabled={readOnly || role === "family"}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            placeholder="腾讯微盘/百度网盘链接"
          />
        </div>

        <div>
          <label className="block text-xs text-bridge-muted mb-1">学长寄语（引导员填写）</label>
          <textarea
            value={postMessage}
            onChange={(e) => setPostMessage(e.target.value)}
            disabled={readOnly || role === "family"}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60 resize-none"
            placeholder="给来访者的鼓励和建議..."
          />
        </div>

        {!readOnly && (
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-bridge-blue hover:bg-blue-600 transition-colors"
          >
            保存确认
          </button>
        )}
      </div>
    );
  }

  // ---- 测验表单 ----
  if (type === "quiz") {
    // 按门类分组显示专业，便于选择
    const grouped = majorOptions.reduce<Record<string, MajorEntry[]>>((acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    }, {});
    const sortedCategories = Object.keys(grouped).sort((a, b) => a.localeCompare(b, "zh-CN"));

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-bridge-blue border-b border-white/10 pb-2">
          数理素质测验 · 结果录入
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-bridge-muted mb-1">测验日期</label>
            <input
              type="date"
              value={quizDate}
              onChange={(e) => setQuizDate(e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs text-bridge-muted mb-1">结果 PDF 链接</label>
            <input
              type="url"
              value={quizPdfUrl}
              onChange={(e) => setQuizPdfUrl(e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
              placeholder="分享链接"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-bridge-muted mb-2">推荐专业（Top 5）</label>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-bridge-muted w-6">{i + 1}.</span>
                <select
                  value={quizMajors[i]}
                  onChange={(e) => {
                    const updated = [...quizMajors];
                    updated[i] = e.target.value;
                    setQuizMajors(updated);
                  }}
                  disabled={readOnly}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 text-xs focus:outline-none focus:border-bridge-blue disabled:opacity-60"
                >
                  <option value="">选择专业</option>
                  {sortedCategories.map((cat) => (
                    <optgroup key={cat} label={cat}>
                      {grouped[cat].map((m) => (
                        <option key={m.code} value={m.name}>{m.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {!readOnly && (
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-bridge-blue hover:bg-blue-600 transition-colors"
          >
            保存测验结果
          </button>
        )}
      </div>
    );
  }

  // ---- 心理辅导表单 ----
  if (type === "counseling") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-bridge-blue border-b border-white/10 pb-2">
          联盟心理辅导
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-bridge-muted mb-1">辅导日期</label>
            <input
              type="date"
              value={counselDate}
              onChange={(e) => setCounselDate(e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs text-bridge-muted mb-1">辅导时间</label>
            <input
              type="time"
              value={counselTime}
              onChange={(e) => setCounselTime(e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-bridge-muted mb-1">咨询师</label>
            <input
              type="text"
              value={counselPsychologist}
              onChange={(e) => setCounselPsychologist(e.target.value)}
              disabled={readOnly || role === "family"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
              placeholder="咨询师姓名"
            />
          </div>
          <div>
            <label className="block text-xs text-bridge-muted mb-1">时长</label>
            <select
              value={counselDuration}
              onChange={(e) => setCounselDuration(e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            >
              <option value="50分钟">50分钟（标准）</option>
              <option value="90分钟">90分钟</option>
            </select>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-white/10 bg-white/5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={counselChecked}
              onChange={(e) => setCounselChecked(e.target.checked)}
              disabled={readOnly || role === "family"}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm text-bridge-muted">Supervisor 已审核确认</span>
          </label>
        </div>

        {!readOnly && (
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-bridge-blue hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        )}
      </div>
    );
  }

  return null;
}