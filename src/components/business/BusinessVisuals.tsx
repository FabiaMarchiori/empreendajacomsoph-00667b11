import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { businessImages } from "./assets";
import "./business-premium.css";

const { marketplace, site, erp, checklist, boxes, soph } = businessImages;

export function ToolIllustration({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={256}
      height={256}
      className={`business-tool-art ${className}`}
    />
  );
}

export function BusinessHero({
  area,
  title,
  description,
  kind,
  children,
}: {
  area?: string;
  title: ReactNode;
  description: string;
  kind: "structure" | "sales" | "management";
  children?: ReactNode;
}) {
  const main =
    kind === "structure" ? marketplace : kind === "sales" ? site : erp;
  const extra = kind === "sales" ? marketplace : checklist;
  return (
    <header className="business-hero">
      <div className="business-hero-copy">
        {area && <p className="business-eyebrow">{area}</p>}
        <h1>{title}</h1>
        <p className="business-intro">{description}</p>
        {children}
      </div>
      <div
        className={`business-hero-art business-hero-art--${kind}`}
        aria-hidden="true"
      >
        <img
          src={main}
          alt=""
          width={512}
          height={512}
          className="business-hero-main"
        />
        <img
          src={extra}
          alt=""
          width={512}
          height={512}
          className="business-hero-extra"
        />
        {kind === "management" && (
          <img
            src={boxes}
            alt=""
            width={512}
            height={512}
            className="business-hero-boxes"
          />
        )}
      </div>
    </header>
  );
}

export function SophAccess({ children }: { children: ReactNode }) {
  return (
    <aside className="business-soph-access business-panel">
      <ToolIllustration src={soph} className="business-soph-art" />
      <div>
        <h2>
          Soph <span className="business-small-tag">Sua Sócia Digital</span>
        </h2>
        <p>{children}</p>
      </div>
      <Link to="/soph" className="business-action">
        <MessageCircle size={20} /> Conversar com a Soph{" "}
        <ArrowRight size={19} />
      </Link>
    </aside>
  );
}

export function ProgressRing({ value }: { value: number }) {
  return (
    <div
      className="business-progress-ring"
      style={{ "--progress": `${value}%` } as CSSProperties}
      role="progressbar"
      aria-label="Progresso geral"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span>{value}%</span>
    </div>
  );
}
