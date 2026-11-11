import { useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { legalDocuments, type LegalDocumentId } from "./documents";

export function LegalDocument({ documentId }: { documentId: LegalDocumentId }) {
  const document = legalDocuments.find(({ id }) => id === documentId)!;
  const title = document.markdown.split("\n")[0].replace(/^# /, "");
  useEffect(() => {
    const previous = window.document.title;
    window.document.title = `${title} | EmpreendaJá com Soph`;
    return () => {
      window.document.title = previous;
    };
  }, [title]);

  return (
    <article className="legal-document" aria-labelledby="legal-title">
      <ReactMarkdown
        skipHtml
        components={{
          h1: ({ children }) => <h1 id="legal-title">{children}</h1>,
          a: ({ href, children }) => {
            if (href?.startsWith("/")) return <Link to={href}>{children}</Link>;
            const external = href?.startsWith("https://");
            return (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                {children}
                {external && (
                  <span className="sr-only"> (abre em nova aba)</span>
                )}
              </a>
            );
          },
        }}
      >
        {document.markdown}
      </ReactMarkdown>
    </article>
  );
}
