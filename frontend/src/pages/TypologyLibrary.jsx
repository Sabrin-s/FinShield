import React, { useState } from 'react';
import { BookOpen, Search, ShieldAlert, CheckCircle2, Bookmark } from 'lucide-react';

const TYPOLOGIES_DATA = [
  {
    id: "TYP-001",
    category: "PLACEMENT",
    title: "Smurfing & Below-Threshold Structuring (BSA 31 U.S.C. 5324)",
    description: "Systematic breakdown of large cash/wire deposits into multiple transactions slightly beneath regulatory reporting thresholds (e.g., $9,000 - $9,950 vs $10,000 CTR limit) within short time windows.",
    regulatory_source: "FinCEN Advisory FIN-2012-A001 / FATF Recommendation 10",
    fatf_indicator: "FATF-IND-01",
    red_flags: [
      "Multiple cash or wire deposits between $8,500 and $9,990 within a 24-72 hour timeframe",
      "Deposits made at different branches or ATMs on the same business day",
      "Immediate consolidation of layered funds and rapid outward wire transfer",
      "Transaction amounts inconsistent with customer stated occupation and net worth"
    ]
  },
  {
    id: "TYP-002",
    category: "LAYERING",
    title: "Pass-Through & Round-Trip Circular Fund Routing",
    description: "Complex multi-hop routing of funds through series of domestic and offshore shell accounts that ultimately return principal capital back to originating beneficiary or affiliate entities with disguised commercial rationale.",
    regulatory_source: "FATF Guidance on Concealment of Beneficial Ownership",
    fatf_indicator: "FATF-IND-05",
    red_flags: [
      "Funds enter an account and depart within hours/days with minimal balance retention (Pass-through ratio > 90%)",
      "Closed-loop graph topology where source entity receives funds back via intermediary nodes",
      "Vague transaction descriptions such as 'consultancy', 'intercompany advance', or 'service fee'",
      "Involvement of high-risk secrecy jurisdictions (BVI, Panama, Cyprus, Seychelles)"
    ]
  },
  {
    id: "TYP-003",
    category: "LAYERING",
    title: "Money Mule Ring & Funnel Account Dispersal",
    description: "A central coordinator collects illicit proceeds into a primary funnel account, which then rapidly fans out split payments to recruited 'mule' accounts who withdraw cash at ATMs, buy crypto, or wire funds overseas.",
    regulatory_source: "FinCEN Advisory on Money Mule Schemes (FIN-2020-A003)",
    fatf_indicator: "FATF-IND-08",
    red_flags: [
      "Sudden dramatic surge in transaction volume on newly opened retail checking accounts",
      "High node degree fan-out pattern in transaction graph (1 to many rapid disbursements)",
      "Immediate ATM cash withdrawals or crypto gateway purchases following inbound transfers",
      "Account holder profile represents vulnerable demographic with no commercial profile"
    ]
  },
  {
    id: "TYP-004",
    category: "SANCTIONS_EVASION",
    title: "OFAC Sanctions Circumvention via Front Companies & Intermediaries",
    description: "Obfuscation of sanctioned entities or individuals using non-sanctioned front companies, nominee directors, or nesting correspondent banking channels to move capital through Western financial institutions.",
    regulatory_source: "OFAC Sanctions Compliance Guidance / US Treasury E.O. 14024",
    fatf_indicator: "FATF-IND-12",
    red_flags: [
      "Beneficial owner or corporate officer name phonetic match to OFAC Specially Designated Nationals (SDN) list",
      "Payment originator or beneficiary located in transit hubs bordering sanctioned territories",
      "Sudden alteration of wire routing instructions to exclude explicit entity names",
      "Transactions involving dual-use high technology with offshore trading entities"
    ]
  }
];

export default function TypologyLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filtered = TYPOLOGIES_DATA.filter((t) => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.red_flags.some(rf => rf.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>FATF & FinCEN Regulatory Typology Vector Library</span>
            </h2>
            <p className="text-xs text-slate-400">
              Pre-indexed regulatory red flags and legal precedents utilized by Evidence RAG Agent
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search typologies, red flags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-sans w-72"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2">
          {['ALL', 'PLACEMENT', 'LAYERING', 'SANCTIONS_EVASION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((typ) => (
          <div key={typ.id} className="glass-panel p-5 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  {typ.id} • {typ.fatf_indicator}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {typ.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{typ.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{typ.description}</p>
            </div>

            {/* Red Flags */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">
                Key Forensic Red Flags:
              </span>
              <ul className="space-y-1 text-xs text-slate-400 font-sans">
                {typ.red_flags.map((rf, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
              Authority: <strong className="text-slate-300">{typ.regulatory_source}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
