---
name: tailwind-only
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.css$
  - field: new_text
    operator: regex_match
    pattern: .*
---

Tailwind-only 项目：请勿在 .css 文件中添加自定义样式。使用 Tailwind 工具类或 @layer components。
.globals.css 中仅保留 @tailwind 指令和 bridge-watermark 等无法用 Tailwind 表达的极端情况。
