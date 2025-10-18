import { visit } from "unist-util-visit";

/**
 * remarkCaptureComponent - 精确截取 <ComponentDisplayer> 的 children 原始源码（保留所有空格与换行）
 */
export default function remarkCaptureComponent() {
  return (tree, file) => {
    visit(tree, "mdxJsxFlowElement", (node) => {
      if (node.name !== "ComponentDisplayer") return;

      const start = node.position?.start?.offset;
      const end = node.position?.end?.offset;
      let inner = "";

      if (typeof start === "number" && typeof end === "number") {
        // ✅ 直接从原始文件中截取完整的片段
        const raw = file.value.slice(start, end);

        // ✅ 去掉外层的标签，保留原始空格、换行、缩进
        inner = raw
          .replace(/^[\s\S]*?<ComponentDisplayer\b[^>]*?>/, "")
          .replace(/<\/ComponentDisplayer>\s*$/, "");
      } else {
        // ⚙️ 兜底逻辑：AST 无 offset 时，尝试用正则匹配整个标签块
        const match = file.value.match(
          /<ComponentDisplayer\b[^>]*?>([\s\S]*?)<\/ComponentDisplayer>/i
        );
        if (match) {
          inner = match[1];
        } else {
          // ⚙️ 最后兜底：拼接子节点纯文本（无法保留标签）
          inner = Array.isArray(node.children)
            ? node.children.map((c) => c.value ?? "").join("")
            : "";
        }
      }

      // ✅ 给节点注入 code 属性
      node.attributes.push({
        type: "mdxJsxAttribute",
        name: "code",
        value: inner,
      });
    });
  };
}
