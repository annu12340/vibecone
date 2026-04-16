import { Gavel, BookOpen, FileText } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";

export function SidebarPanels({ similarCases, relevantLaws, caseData }) {
  const hasCases = similarCases?.length > 0;
  const hasLaws = relevantLaws?.length > 0;
  const hasCharges = caseData?.charges?.length > 0;
  const hasDescription = !!caseData?.description;

  if (!hasCases && !hasLaws && !hasCharges && !hasDescription) return null;

  const defaultOpen = [];
  if (hasCharges || hasDescription) defaultOpen.push("case-facts");
  if (hasCases) defaultOpen.push("similar-cases");

  return (
    <div className="bg-white border border-slate-200/60 overflow-hidden shadow-[0_4px_24px_-8px_rgba(11,25,44,0.06)]" data-testid="sidebar-panels">
      <Accordion type="multiple" defaultValue={defaultOpen}>
        {/* Case Facts */}
        {(hasCharges || hasDescription) && (
          <AccordionItem value="case-facts" className="border-b border-slate-100">
            <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-case-facts">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="font-playfair text-sm text-slate-900">Case Facts</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-3">
                {hasCharges && (
                  <div>
                    <p className="text-xs uppercase text-slate-400 mb-1.5">Charges</p>
                    <div className="flex flex-wrap gap-1">
                      {caseData.charges.map((c) => (
                        <span key={c} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {hasDescription && (
                  <div>
                    <p className="text-xs uppercase text-slate-400 mb-1.5">Description</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{caseData.description}</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Similar Cases */}
        {hasCases && (
          <AccordionItem value="similar-cases" className="border-b border-slate-100">
            <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-similar-cases">
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-slate-500" />
                <span className="font-playfair text-sm text-slate-900">Similar Cases</span>
                <span className="text-xs text-slate-400 ml-1">({similarCases.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="divide-y divide-slate-100">
                {similarCases.slice(0, 5).map((c, i) => (
                  <div key={i} className="py-2.5 first:pt-0">
                    <p className="text-sm font-medium text-slate-900">{c.case_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.court} — {c.year}</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.outcome}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Relevant Laws */}
        {hasLaws && (
          <AccordionItem value="relevant-laws" className="border-0">
            <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-relevant-laws">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span className="font-playfair text-sm text-slate-900">Relevant Laws</span>
                <span className="text-xs text-slate-400 ml-1">({relevantLaws.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="divide-y divide-slate-100">
                {relevantLaws.slice(0, 5).map((law, i) => (
                  <div key={i} className="py-2.5 first:pt-0">
                    <p className="text-xs font-mono font-semibold text-[#0B192C]">{law.code}</p>
                    <p className="text-sm text-slate-800 mt-0.5">{law.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{law.relevance}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
