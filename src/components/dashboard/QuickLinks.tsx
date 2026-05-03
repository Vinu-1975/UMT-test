import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { QUICK_LINKS } from "@/lib/mock-data";

export function QuickLinks() {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {QUICK_LINKS.map((q) => (
        <li key={q.title}>
          <Link
            to={q.to}
            className="group flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/50"
          >
            <div>
              <div className="text-sm font-medium">{q.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{q.description}</div>
            </div>
            <ArrowRight className="size-4 shrink-0 translate-x-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
