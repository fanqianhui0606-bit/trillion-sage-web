"use client";

import { useState, useEffect } from "react";
import GlassCard from "@/components/shared/GlassCard";

interface SubmissionRecord {
  timestamp: string;
  userName: string;
  activationCode: string;
  edition: string;
  answers: Record<string, string | string[]>;
  scores: {
    objective: Record<string, number>;
    subjective: {
      interestAmbition: number;
      practicalBenefit: number;
      practicalShare: number;
      valueTier: number;
    };
    subjectInterest?: Record<string, number>;
  };
  matches: {
    majorId: string;
    majorName: string;
    score: number;
    valueSim?: number;
    interestSim?: number;
    habitsSim?: number;
    abilitySim?: number;
  }[];
}

interface FamilyRecord {
  code: string;
  student_wechat_name?: string;
  parent_wechat_name?: string;
  student_completed?: boolean;
  parent_completed?: boolean;
  student_authorized?: boolean;
  parent_authorized?: boolean;
  paid?: boolean;
}

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
  agentName?: string;
  borderColor?: string;
}

interface ChatRecord {
  timestamp: string;
  role: "student" | "parent" | "unknown";
  code: string;
  messages: ChatMessage[];
  report: Record<string, any> | null;
}

interface AppointmentRecord {
  timestamp: string;
  studentName: string;
  contact: string;
  grade: string;
  selectedFields: string[];
  concern: string;
  appointmentId: string;
}

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [records, setRecords] = useState<SubmissionRecord[]>([]);
  const [familyRecords, setFamilyRecords] = useState<FamilyRecord[]>([]);
  const [chatRecords, setChatRecords] = useState<ChatRecord[]>([]);
  const [appointmentRecords, setAppointmentRecords] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<"quiz" | "family" | "chat" | "appointment">("quiz");
  const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Quiz filters
  const [searchQuery, setSearchQuery] = useState("");
  const [versionFilter, setVersionFilter] = useState("all"); // all, pro, simple

  // Family creation form states
  const [studentWechatInput, setStudentWechatInput] = useState("");
  const [parentWechatInput, setParentWechatInput] = useState("");
  const [familySearchQuery, setFamilySearchQuery] = useState("");

  // Check session storage on mount
  useEffect(() => {
    const savedKey = sessionStorage.getItem("tsg_admin_verified");
    if (savedKey === "TSG_ADMIN_PAGE") {
      setIsAuthenticated(true);
      fetchSubmissions();
      fetchFamilyRecords();
      fetchChatRecords();
      fetchAppointmentRecords();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey.trim() === "TSG_ADMIN_PAGE") {
      sessionStorage.setItem("tsg_admin_verified", "TSG_ADMIN_PAGE");
      setIsAuthenticated(true);
      setError("");
      fetchSubmissions();
      fetchFamilyRecords();
      fetchChatRecords();
      fetchAppointmentRecords();
    } else {
      setError("管理密钥无效，请重新输入");
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (data.success) {
        const sorted = (data.list || []).sort(
          (a: SubmissionRecord, b: SubmissionRecord) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setRecords(sorted);
      } else {
        setError(data.error || "读取测评数据失败");
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      setError("请求测评接口失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyRecords = async () => {
    try {
      const res = await fetch("/api/family-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_list",
          adminKey: "TSG_ADMIN_PAGE"
        })
      });
      const data = await res.json();
      if (data.success) {
        setFamilyRecords(data.list || []);
      }
    } catch (err) {
      console.error("Failed to fetch family records:", err);
    }
  };

  const fetchChatRecords = async () => {
    try {
      const res = await fetch("/api/chat-submissions?adminKey=TSG_ADMIN_PAGE");
      const data = await res.json();
      if (data.success) {
        const sorted = (data.list || []).sort(
          (a: ChatRecord, b: ChatRecord) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setChatRecords(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch chat records:", err);
    }
  };

  const fetchAppointmentRecords = async () => {
    try {
      const res = await fetch("/api/appointments?adminKey=TSG_ADMIN_PAGE");
      const data = await res.json();
      if (data.success) {
        const sorted = (data.list || []).sort(
          (a: AppointmentRecord, b: AppointmentRecord) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setAppointmentRecords(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch appointment records:", err);
    }
  };

  const handleCreateFamilyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentWechatInput.trim() || !parentWechatInput.trim()) {
      alert("学生微信昵称与家长微信昵称均不能为空！");
      return;
    }
    try {
      const res = await fetch("/api/family-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_create",
          adminKey: "TSG_ADMIN_PAGE",
          student_wechat_name: studentWechatInput.trim(),
          parent_wechat_name: parentWechatInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`专属家庭关联码生成成功！\n专属码: ${data.code}`);
        setStudentWechatInput("");
        setParentWechatInput("");
        fetchFamilyRecords(); // Refresh list
      } else {
        alert(data.error || "生成家庭关联码失败");
      }
    } catch (err) {
      console.error("Failed to create family code:", err);
      alert("创建失败，网络或接口出现错误");
    }
  };

  const handleManualPay = async (targetCode: string) => {
    if (!confirm(`您确定要为家庭关联码 [${targetCode}] 手动开通 VIP 深度报告权限吗？`)) {
      return;
    }
    try {
      const res = await fetch("/api/family-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_pay",
          adminKey: "TSG_ADMIN_PAGE",
          targetCode
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("VIP 开通成功！");
        fetchFamilyRecords(); // Refresh list
      } else {
        alert(data.error || "开通 VIP 失败");
      }
    } catch (err) {
      console.error("Failed to unlock VIP:", err);
      alert("开通失败，接口请求发生错误");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("tsg_admin_verified");
    setIsAuthenticated(false);
    setRecords([]);
    setFamilyRecords([]);
    setAdminKey("");
  };

  // Convert array to CSV and download (Quiz)
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert("没有可导出的数据");
      return;
    }

    const headers = [
      "提交时间",
      "姓名",
      "版本",
      "激活码/码贴",
      "价值理想分",
      "价值实际分",
      "价值档位",
      "数学兴趣",
      "物理兴趣",
      "化学兴趣",
      "生物兴趣",
      "计算机兴趣",
      "前三名匹配专业（匹配度）"
    ];

    const csvRows = [headers.join(",")];

    for (const r of records) {
      const matchesStr = (r.matches || [])
        .slice(0, 3)
        .map((m) => `${m.majorName}(${(m.score * 100).toFixed(0)}%)`)
        .join(" | ");

      const dateStr = new Date(r.timestamp).toLocaleString("zh-CN", { hour12: false });
      const editionStr = r.edition === "simple" ? "体验版" : "专业版";

      const row = [
        `"${dateStr}"`,
        `"${r.userName.replace(/"/g, '""')}"`,
        `"${editionStr}"`,
        `"${r.activationCode || ""}"`,
        r.scores.subjective?.interestAmbition ?? 0,
        r.scores.subjective?.practicalBenefit ?? 0,
        r.scores.subjective?.valueTier ?? "—",
        r.scores.subjectInterest?.["数学"] ?? "—",
        r.scores.subjectInterest?.["物理"] ?? "—",
        r.scores.subjectInterest?.["化学"] ?? "—",
        r.scores.subjectInterest?.["生物"] ?? "—",
        r.scores.subjectInterest?.["计算机"] ?? "—",
        `"${matchesStr.replace(/"/g, '""')}"`
      ];

      csvRows.push(row.join(","));
    }

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `千殊桥梁计划_测评留痕数据_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert family records to CSV and download
  const handleExportFamilyCSV = () => {
    if (familyRecords.length === 0) {
      alert("没有可导出的家庭聊天数据");
      return;
    }

    const headers = [
      "专属家庭关联码",
      "学生微信昵称",
      "学生聊天完成",
      "学生授权状态",
      "家长微信昵称",
      "家长聊天完成",
      "家长授权状态",
      "报告付费状态"
    ];

    const csvRows = [headers.join(",")];

    for (const r of familyRecords) {
      const studentAuth = r.student_authorized === true ? "已授权" : r.student_authorized === false ? "已拒绝" : "未选择";
      const parentAuth = r.parent_authorized === true ? "已授权" : r.parent_authorized === false ? "已拒绝" : "未选择";

      const row = [
        `"${r.code}"`,
        `"${(r.student_wechat_name || "").replace(/"/g, '""')}"`,
        r.student_completed ? "已完成" : "未完成",
        studentAuth,
        `"${(r.parent_wechat_name || "").replace(/"/g, '""')}"`,
        r.parent_completed ? "已完成" : "未完成",
        parentAuth,
        r.paid ? "已开通VIP" : "未开通"
      ];

      csvRows.push(row.join(","));
    }

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `千殊桥梁计划_双端家庭共振数据_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filters quiz
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.activationCode || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (versionFilter === "pro") {
      return matchesSearch && r.edition !== "simple";
    }
    if (versionFilter === "simple") {
      return matchesSearch && r.edition === "simple";
    }
    return matchesSearch;
  });

  // Filters family links
  const filteredFamilyRecords = familyRecords.filter((r) => {
    const term = familySearchQuery.toLowerCase();
    return (
      r.code.toLowerCase().includes(term) ||
      (r.student_wechat_name || "").toLowerCase().includes(term) ||
      (r.parent_wechat_name || "").toLowerCase().includes(term)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#0a0f18]">
        <GlassCard className="max-w-md w-full p-8 text-center border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.jpg" alt="Logo" className="h-12 mx-auto mb-4 rounded" />
          <h1 className="text-xl font-bold text-bridge-blue font-serif mb-6">管理员留痕数据后台</h1>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-bridge-blue mb-1">请输入管理密钥 (Admin Key)</label>
              <input
                type="password"
                placeholder="管理密钥"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-900/40 text-sm text-white focus:outline-none focus:border-bridge-blue transition-colors font-mono"
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs text-center font-semibold mt-2">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-white text-sm bg-bridge-blue hover:bg-blue-700 transition-colors shadow-md border-0 cursor-pointer"
            >
              登录并查看
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-100 pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
              <span className="text-bridge-blue font-bold font-serif">TrillionSage</span> 管理后台
            </h1>
            <p className="text-xs text-bridge-muted mt-1">
              管理测评数据及微信双端共振关联账户
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={activeTab === "quiz" ? handleExportCSV : handleExportFamilyCSV}
              className="px-4 py-2 text-xs font-bold text-white bg-bridge-blue hover:bg-blue-700 rounded-lg shadow-md border-0 cursor-pointer transition-colors"
            >
              导出 {activeTab === "quiz" ? "测评" : "家庭"} CSV 表格
            </button>
            <button
              onClick={activeTab === "quiz" ? fetchSubmissions : fetchFamilyRecords}
              className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white border border-white/10 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
            >
              刷新数据
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/5 rounded-lg cursor-pointer transition-colors"
            >
              退出
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-6 border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`pb-3 text-sm font-serif font-bold transition-all cursor-pointer border-b-2 px-1 bg-transparent ${
              activeTab === "quiz" ? "border-bridge-blue text-white" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            数理测评留痕（Quiz）
          </button>
          <button
            onClick={() => setActiveTab("family")}
            className={`pb-3 text-sm font-serif font-bold transition-all cursor-pointer border-b-2 px-1 bg-transparent ${
              activeTab === "family" ? "border-bridge-blue text-white" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            家庭共振（双端聊天）管理
          </button>
        </div>

        {/* QUIZ TAB PANEL */}
        {activeTab === "quiz" && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="搜索姓名或激活码..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-lg border border-white/10 bg-slate-900/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-bridge-blue"
                />
              </div>

              <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                <span className="text-xs text-bridge-muted">测验版本:</span>
                <select
                  value={versionFilter}
                  onChange={(e) => setVersionFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900 text-xs text-slate-300 focus:outline-none focus:border-bridge-blue"
                >
                  <option value="all">全部记录</option>
                  <option value="pro">专业版</option>
                  <option value="simple">体验版</option>
                </select>
                <span className="text-xs text-bridge-muted font-mono bg-white/5 px-2 py-1 rounded">
                  共 {filteredRecords.length} 条
                </span>
              </div>
            </div>

            {/* Data List */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-4 border-bridge-blue/30 border-t-bridge-blue rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-bridge-muted">载入数据中...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <GlassCard className="py-16 text-center text-bridge-muted text-xs">
                未检索到对应的答题记录
              </GlassCard>
            ) : (
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md">
                <table className="w-full border-collapse text-left text-xs text-slate-300">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-white/10 text-bridge-blue font-bold font-serif">
                      <th className="p-4">测试时间</th>
                      <th className="p-4">姓名</th>
                      <th className="p-4">版本</th>
                      <th className="p-4">激活码/兑换码</th>
                      <th className="p-4">价值导向</th>
                      <th className="p-4">学科兴趣倾向 (数/物/化/生/计)</th>
                      <th className="p-4">Top 3 匹配专业推荐</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRecords.map((r, idx) => {
                      const dateStr = new Date(r.timestamp).toLocaleString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                      });
                      const isSim = r.edition === "simple";
                      
                      const interests = r.scores.subjectInterest
                        ? `${r.scores.subjectInterest["数学"]}/${r.scores.subjectInterest["物理"]}/${r.scores.subjectInterest["化学"]}/${r.scores.subjectInterest["生物"]}/${r.scores.subjectInterest["计算机"]}`
                        : "—";

                      const valTier = r.scores.subjective?.valueTier;
                      const idealPct = r.scores.subjective?.practicalShare != null 
                        ? `${(100 - r.scores.subjective.practicalShare * 100).toFixed(0)}%理想` 
                        : "—";

                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono text-slate-400 whitespace-nowrap">{dateStr}</td>
                          <td className="p-4 font-semibold text-white">{r.userName}</td>
                          <td className="p-4">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${isSim ? 'bg-green-500/10 text-green-400' : 'bg-bridge-blue/10 text-bridge-blue'}`}>
                              {isSim ? "体验" : "专业"}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-400">{r.activationCode || "—"}</td>
                          <td className="p-4">
                            {isSim ? (
                              <span className="text-slate-500">体验版未录入</span>
                            ) : (
                              <span>第 {valTier} 档 ({idealPct})</span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-slate-400">{interests}</td>
                          <td className="p-4">
                            <div className="flex flex-col gap-0.5">
                              {(r.matches || []).slice(0, 3).map((m, i) => (
                                <span key={i} className="text-[11px] font-serif">
                                  {i + 1}. {m.majorName}
                                  <strong className="text-bridge-gold font-mono ml-1 font-semibold">
                                    {(m.score * 100).toFixed(0)}%
                                  </strong>
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* FAMILY TAB PANEL */}
        {activeTab === "family" && (
          <div className="space-y-8 animate-fade-in">
            {/* Create Code Form */}
            <GlassCard className="p-6 border border-white/10">
              <h2 className="text-sm font-bold text-bridge-blue font-serif mb-4 flex items-center gap-1.5">
                <span>➕</span> 生成家庭专属共振关联码
              </h2>
              <form onSubmit={handleCreateFamilyCode} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-serif">学生微信昵称 (例: 张三)</label>
                  <input
                    type="text"
                    placeholder="请输入学生端微信昵称"
                    value={studentWechatInput}
                    onChange={(e) => setStudentWechatInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-900/40 text-xs text-white focus:outline-none focus:border-bridge-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-serif">家长微信昵称 (例: 张三爸爸)</label>
                  <input
                    type="text"
                    placeholder="请输入家长端微信昵称"
                    value={parentWechatInput}
                    onChange={(e) => setParentWechatInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-900/40 text-xs text-white focus:outline-none focus:border-bridge-blue"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-lg font-bold text-white text-xs bg-bridge-blue hover:bg-blue-700 transition-colors shadow-md border-0 cursor-pointer"
                  >
                    一键生成并录入关联码
                  </button>
                </div>
              </form>
            </GlassCard>

            {/* List & Search */}
            <div>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white font-serif flex items-center gap-1.5">
                  <span>📋</span> 专属关联码绑定列表
                </h2>
                <div className="flex gap-3 items-center w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="搜索微信昵称或关联码..."
                    value={familySearchQuery}
                    onChange={(e) => setFamilySearchQuery(e.target.value)}
                    className="w-full pl-3 pr-3 py-1.5 rounded-lg border border-white/10 bg-slate-900/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-bridge-blue"
                  />
                  <span className="text-[10px] text-bridge-muted font-mono whitespace-nowrap bg-white/5 px-2 py-1.5 rounded">
                    共 {filteredFamilyRecords.length} 户
                  </span>
                </div>
              </div>

              {filteredFamilyRecords.length === 0 ? (
                <GlassCard className="py-12 text-center text-bridge-muted text-xs">
                  暂未查询到任何专属关联码绑定记录
                </GlassCard>
              ) : (
                <div className="overflow-x-auto border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md">
                  <table className="w-full border-collapse text-left text-xs text-slate-300">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-white/10 text-bridge-blue font-bold font-serif">
                        <th className="p-4">专属关联码</th>
                        <th className="p-4">学生端微信昵称</th>
                        <th className="p-4 text-center">学生对话状态</th>
                        <th className="p-4 text-center">学生授权状态</th>
                        <th className="p-4">家长端微信昵称</th>
                        <th className="p-4 text-center">家长对话状态</th>
                        <th className="p-4 text-center">家长授权状态</th>
                        <th className="p-4 text-center">付费解锁状态</th>
                        <th className="p-4 text-center">后台操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredFamilyRecords.map((r, idx) => {
                        const studentAuth = r.student_authorized === true ? "已授权" : r.student_authorized === false ? "已拒绝" : "未选择";
                        const parentAuth = r.parent_authorized === true ? "已授权" : r.parent_authorized === false ? "已拒绝" : "未选择";
                        
                        return (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono font-bold text-white select-all">{r.code}</td>
                            <td className="p-4 font-semibold">{r.student_wechat_name || "—"}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${r.student_completed ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                                {r.student_completed ? "已完成" : "未完成"}
                              </span>
                            </td>
                            <td className="p-4 text-center font-serif">
                              <span className={`text-[11px] ${r.student_authorized === true ? 'text-green-400 font-bold' : r.student_authorized === false ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                                {studentAuth}
                              </span>
                            </td>
                            <td className="p-4 font-semibold">{r.parent_wechat_name || "—"}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${r.parent_completed ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                                {r.parent_completed ? "已完成" : "未完成"}
                              </span>
                            </td>
                            <td className="p-4 text-center font-serif">
                              <span className={`text-[11px] ${r.parent_authorized === true ? 'text-green-400 font-bold' : r.parent_authorized === false ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                                {parentAuth}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${r.paid ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                {r.paid ? "💎 已开通" : "🔒 未开通"}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {!r.paid ? (
                                <button
                                  onClick={() => handleManualPay(r.code)}
                                  className="px-2.5 py-1 text-[10px] font-bold text-white bg-green-600 hover:bg-green-700 rounded transition-colors border-0 cursor-pointer shadow-sm"
                                >
                                  手动激活 VIP
                                </button>
                              ) : (
                                <span className="text-slate-500 text-[10px]">已全部解锁</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
