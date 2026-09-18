"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ChatEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatEntryModal({ isOpen, onClose }: ChatEntryModalProps) {
  const router = useRouter();
  const [code, setCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCode(sessionStorage.getItem("family_code") || "");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSelectRole = (role: "student" | "parent") => {
    const trimmedCode = code.trim().toUpperCase();
    // 关联码可选：填写则保存，便于后续双端对比；不填写也可直接进入
    if (trimmedCode && /^[A-Z0-9_-]{3,20}$/.test(trimmedCode)) {
      sessionStorage.setItem("family_code", trimmedCode);
    } else if (!trimmedCode) {
      sessionStorage.removeItem("family_code");
    }

    onClose();
    if (role === "student") {
      router.push("/burrow");
    } else {
      router.push("/parent-chat");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1a1c24]/50 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#FAF7F2] to-[#F3EDE2] border border-bridge-blue/20 rounded-xl shadow-[0_20px_50px_rgba(46,117,182,0.15)] overflow-hidden animate-scale-in">
        <div className="h-1 bg-gradient-to-r from-bridge-blue via-bridge-gold to-bridge-blue" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors text-xl font-sans"
        >
          &times;
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="font-sans text-xl font-bold text-stone-850 tracking-wider">
              灵魂聊天共振入口
            </h3>
            <p className="text-xs text-bridge-muted mt-1">
              免费体验无需门槛，点击即可开始
            </p>
          </div>

          <div className="bg-white/60 border border-stone-200 rounded-lg p-4 mb-5">
            <label className="block text-xs font-bold text-stone-700 tracking-wider mb-2">
              家庭关联码（可选）
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="选填，用于双端对比报告"
              maxLength={20}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded focus:border-bridge-blue/50 focus:outline-none text-sm font-mono text-stone-800"
            />
            <p className="text-[10px] text-bridge-muted mt-2 leading-relaxed">
              不填也可直接体验。若需学生端与家长端对比，可稍后向助理获取关联码。
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSelectRole("student")}
              className="w-full py-3 text-white rounded font-sans text-sm tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border-0 cursor-pointer bg-bridge-blue hover:bg-blue-700"
            >
              探寻星轨的少年（学生端）
            </button>

            <button
              onClick={() => handleSelectRole("parent")}
              className="w-full py-3 text-white rounded font-sans text-sm tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border-0 cursor-pointer bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
            >
              静候回音的守护者（家长端）
            </button>
          </div>

          <div className="text-center mt-5">
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-800 text-xs hover:underline bg-transparent border-0 cursor-pointer"
            >
              返回主页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
