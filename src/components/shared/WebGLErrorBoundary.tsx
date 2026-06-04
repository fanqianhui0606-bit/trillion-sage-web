"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[WebGLErrorBoundary] 3D render failed:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex items-center justify-center w-full h-64 bg-bridge-3d-bg rounded-xl text-white/50 text-sm">
            3D 视图加载失败，请尝试刷新页面或使用其他浏览器
          </div>
        )
      );
    }

    return this.props.children;
  }
}
