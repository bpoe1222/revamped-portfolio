import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export const articleMarkdownComponents: Components = {
  h1: ({ children }) => <h2>{children}</h2>,
};

export function Markdown({ content }: { content: string }) {
  return (
    <div className="article-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={articleMarkdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
