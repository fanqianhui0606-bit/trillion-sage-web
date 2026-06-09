"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ChatEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatEntryModal({ isOpen, onClose }: ChatEntryModalProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Lock scroll
      setCode(sessionStorage.getItem("family_code") || "");
      setErrorMsg("");
      setIsValidating(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSelectRole = async (role: "student" | "parent") => {
    const trimmedCode = code.trim().toUpperCase();
    
    if (!trimmedCode) {
      setErrorMsg("请输入您的专属家庭关联码（需通过公众号/助理获取）");
      return;
    }

    // Validate code format (max 20 to allow TSG_ADMIN_PAGE)
    const validFormat = /^[A-Z0-9_-]{3,20}$/.test(trimmedCode);
    if (!validFormat) {
      setErrorMsg("关联码格式不正确（应为字母、数字、下划线或连字符）");
      return;
    }

    setIsValidating(true);
    setErrorMsg("");

    try {


      // 2. 校验普通码
      const res = await fetch(`/api/family-link?code=${trimmedCode}`);
      if (!res.ok) {
        const errData = await res.json();
        setErrorMsg(errData.error || "未查询到该专属关联码，请确认或联系助理");
        setIsValidating(false);
        return;
      }

      const data = await res.json();
      
      // 普通激活码排他性验证
      if (role === "student" && data.student_completed) {
        setErrorMsg("该专属关联码的学生端对话已完成，不可重复进入。若有疑问，请联系助理。");
        setIsValidating(false);
        return;
      }
      if (role === "parent" && data.parent_completed) {
        setErrorMsg("该专属关联码的家长端对话已完成，不可重复进入。若有疑问，请联系助理。");
        setIsValidating(false);
        return;
      }

      sessionStorage.setItem("family_code", trimmedCode);
      sessionStorage.setItem("student_wechat_name", data.student_wechat_name || "");
      sessionStorage.setItem("parent_wechat_name", data.parent_wechat_name || "");
      
      setIsValidating(false);
      onClose();

      if (role === "student") {
        router.push("/burrow");
      } else {
        router.push("/parent-chat");
      }
    } catch (err) {
      console.error("Validation error:", err);
      setErrorMsg("校验连接失败，请检查网络后再试");
      setIsValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1a1c24]/50 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#FAF7F2] to-[#F3EDE2] border border-bridge-blue/20 rounded-xl shadow-[0_20px_50px_rgba(46,117,182,0.15)] overflow-hidden animate-scale-in">
        {/* Top gold line indicator */}
        <div className="h-1 bg-gradient-to-r from-bridge-blue via-bridge-gold to-bridge-blue" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isValidating}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors text-xl font-sans disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &times;
        </button>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="font-serif text-xl font-bold text-stone-850 tracking-wider">
              思维共振聊天入口
            </h3>
            <p className="text-xs text-bridge-muted font-serif mt-1">
              通过专属关联码，发掘逻辑潜质与育儿共鸣
            </p>
          </div>

          {/* Association Code Input Section */}
          <div className="bg-white/60 border border-stone-200 rounded-lg p-4 mb-5">
            <label className="block text-xs font-serif font-bold text-stone-700 tracking-wider mb-2">
              家庭关联码 (必填)
            </label>
            <input
              type="text"
              value={code}
              disabled={isValidating}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setErrorMsg("");
              }}
              placeholder="请输入您的专属关联码"
              maxLength={20}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded focus:border-bridge-blue/50 focus:outline-none text-sm font-mono text-stone-800 disabled:bg-stone-100 disabled:text-stone-400"
            />
            
            {errorMsg && (
              <p className="text-xs text-red-500 font-serif mt-2 font-semibold">{errorMsg}</p>
            )}

            <div className="mt-4 pt-3 border-t border-stone-200/50 flex gap-4 items-center">
              <div className="w-16 h-16 relative flex-shrink-0 bg-white p-0.5 rounded border border-stone-200">
                <Image
                  src="/images/wechat.jpg"
                  alt="微信公众号"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <div className="text-[10px] text-bridge-muted leading-relaxed font-serif">
                <strong>如何获取关联码？</strong><br />
                扫码关注微信公众号「**桥梁计划Bridge**」（或添加助理微信），发送您的微信昵称/微信号，助理将为您和孩子建立专属关联码以追踪聊天档案。
              </div>
            </div>
          </div>

          {/* Role Choice Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSelectRole("student")}
              disabled={isValidating}
              className={`w-full py-3 text-white rounded font-serif text-sm tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border-0 cursor-pointer ${
                isValidating 
                  ? "bg-bridge-blue/50 cursor-not-allowed" 
                  : "bg-bridge-blue hover:bg-blue-700"
              }`}
            >
              {isValidating ? (
                <>
                  <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  家庭轨道校对中...
                </>
              ) : (
                "探寻星轨的少年 (学生端入口)"
              )}
            </button>
            
            <button
              onClick={() => handleSelectRole("parent")}
              disabled={isValidating}
              className={`w-full py-3 text-white rounded font-serif text-sm tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border-0 cursor-pointer ${
                isValidating 
                  ? "bg-amber-600/50 cursor-not-allowed" 
                  : "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
              }`}
            >
              {isValidating ? (
                <>
                  <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  家庭轨道校对中...
                </>
              ) : (
                "静候回音的守护者 (家长端入口)"
              )}
            </button>
          </div>

          <div className="text-center mt-5">
            <button
              onClick={onClose}
              disabled={isValidating}
              className="text-stone-500 hover:text-stone-800 text-xs font-serif hover:underline bg-transparent border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              返回主页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
