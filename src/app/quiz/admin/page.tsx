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

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [records, setRecords] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [versionFilter, setVersionFilter] = useState("all"); // all, pro, simple

  // Check session storage on mount
  useEffect(() => {
    const savedKey = sessionStorage.getItem("tsg_admin_verified");
    if (savedKey === "TSG_ADMIN_PAGE") {
      setIsAuthenticated(true);
      fetchSubmissions();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey.trim() === "TSG_ADMIN_PAGE") {
      sessionStorage.setItem("tsg_admin_verified", "TSG_ADMIN_PAGE");
      setIsAuthenticated(true);
      setError("");
      fetchSubmissions();
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
        // Sort by timestamp desc
        const sorted = (data.list || []).sort(
          (a: SubmissionRecord, b: SubmissionRecord) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setRecords(sorted);
      } else {
        setError(data.error || "读取数据失败");
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      setError("请求接口失败");
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    sessionStorage.removeItem("tsg_admin_verified");
    setIsAuthenticated(false);
    setRecords([]);
    setAdminKey("");
  };

  // Convert array to CSV and download
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

    // Add UTF-8 BOM so Excel displays Chinese characters correctly
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

  // Filter records
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
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
              <span className="text-bridge-blue font-bold font-serif">TrillionSage</span> 管理后台
            </h1>
            <p className="text-xs text-bridge-muted mt-1">
              查看并导出所有学生测试提交的原始数据与推荐结果
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-xs font-bold text-white bg-bridge-blue hover:bg-blue-700 rounded-lg shadow-md border-0 cursor-pointer transition-colors"
            >
              一键导出 CSV 表格
            </button>
            <button
              onClick={fetchSubmissions}
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
                  
                  // Format interests
                  const interests = r.scores.subjectInterest
                    ? `${r.scores.subjectInterest["数学"]}/${r.scores.subjectInterest["物理"]}/${r.scores.subjectInterest["化学"]}/${r.scores.subjectInterest["生物"]}/${r.scores.subjectInterest["计算机"]}`
                    : "—";

                  // Format value orientation
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
      </div>
    </div>
  );
}
