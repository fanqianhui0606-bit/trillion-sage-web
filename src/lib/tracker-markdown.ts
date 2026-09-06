/**
 * tracker-markdown.ts
 * 轻量 Markdown → HTML（对齐本地咨询流程表 renderMarkdown）
 */

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string): string {
  return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function splitRow(r: string): string[] {
  return r.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

function renderTable(rows: string[]): string {
  if (!rows.length) return "";
  const header = splitRow(rows[0]);
  let bodyStart = 1;
  if (rows[1] && /^\|?[\s:|-]+\|?$/.test(rows[1])) bodyStart = 2;
  const thead = `<thead><tr>${header.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`;
  const body = rows
    .slice(bodyStart)
    .map((r) => `<tr>${splitRow(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
    .join("");
  return `<table class="agreement-table">${thead}<tbody>${body}</tbody></table>`;
}

const LIST_RE = /^(\d+\.\s|[-*]\s|·\s)/;

/** 将协议 Markdown 转为带换行/表格/标题的 HTML */
export function renderMarkdown(md: string): string {
  const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      const html = para.map(inline).join("<br />");
      if (html.includes("agreement-doc-btn") || html.includes("agreement-doc-btns") || html.includes("doc-btn")) {
        out.push(html);
      } else {
        out.push(`<p>${html}</p>`);
      }
      para = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t) {
      flushPara();
      i++;
      continue;
    }
    // 已是 HTML 片段（交互按钮区）
    if (t.startsWith("<")) {
      flushPara();
      out.push(t);
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(t)) {
      flushPara();
      out.push("<hr />");
      i++;
      continue;
    }
    const h = t.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
      i++;
      continue;
    }
    if (t.startsWith("|")) {
      flushPara();
      const tbl: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tbl.push(lines[i].trim());
        i++;
      }
      out.push(renderTable(tbl));
      continue;
    }
    if (t.startsWith(">")) {
      flushPara();
      const bq: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        bq.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${bq.map(inline).join("<br />")}</blockquote>`);
      continue;
    }
    if (LIST_RE.test(t)) {
      flushPara();
      const ordered = /^\d+\.\s/.test(t);
      const items: string[] = [];
      while (i < lines.length && LIST_RE.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(LIST_RE, ""));
        i++;
      }
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag}>${items.map((it) => `<li>${inline(it)}</li>`).join("")}</${tag}>`);
      continue;
    }
    para.push(t);
    i++;
  }
  flushPara();
  return out.join("\n");
}

/** 占位符替换（值可为 HTML，不转义） */
export function personalizeMarkdown(md: string, vars: Record<string, string>): string {
  let out = String(md);
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{{${k}}}`).join(v ?? "");
  }
  return out;
}
