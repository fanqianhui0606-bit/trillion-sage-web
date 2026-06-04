---
name: 3d-lifecycle-check
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/components/charts/.*\.tsx?$
  - field: new_text
    operator: not_contains
    pattern: 'use client'
---

3D 组件必须包含 `'use client'` 指令，且应在 useEffect cleanup 中 dispose WebGL 资源。
