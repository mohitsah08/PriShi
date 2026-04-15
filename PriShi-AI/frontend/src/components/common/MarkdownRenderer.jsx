import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export function MarkdownRenderer({ content, streaming = false }) {
  return (
    <div className={`markdown-body max-w-none text-sm leading-7 ${streaming ? 'stream-cursor' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        skipHtml
        components={{
          code(props) {
            const { inline, className, children, ...rest } = props;

            if (inline) {
              return (
                <code
                  className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.82rem]"
                  {...rest}
                >
                  {children}
                </code>
              );
            }

            return (
              <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-4">
                <code className={className} {...rest}>
                  {children}
                </code>
              </pre>
            );
          }
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}
