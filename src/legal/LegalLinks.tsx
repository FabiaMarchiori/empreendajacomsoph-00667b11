import { NavLink } from "react-router-dom";
import { legalDocuments } from "./documents";
import "./legal.css";

export function LegalLinks({
  label = "Documentos jurídicos",
}: {
  label?: string;
}) {
  return (
    <nav aria-label={label} className="legal-links">
      <ul>
        {legalDocuments.map(({ id, path, label: text }) => (
          <li key={id}>
            <NavLink to={path}>{text}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
