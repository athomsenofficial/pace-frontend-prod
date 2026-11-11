import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileCheck2,
  Calculator,
  Clock,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
  Building2,
  UserCheck,
  Briefcase,
  FileText,
  CheckCircle2,
  Award,
  Lock,
  Compass,
  Flag,
} from "lucide-react";

export default function Home() {
  return (
    <div>
      <Hero />
      <StatStrip />
      <Tools />
      <PolicySection />
      <Audiences />
      <Workflow />
      <CtaFooter />
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute right-0 top-0 bottom-0 hidden md:flex items-center pr-12 pointer-events-none select-none">
        <span className="text-[12rem] font-black text-white/5 leading-none">
          PACE
        </span>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span className="text-white/90 text-xs font-semibold uppercase tracking-widest">
              Department of the Air Force
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-4">
            Personnel &amp;
            <br />
            <span className="text-gold-light">Administrative</span>
            <br />
            Collaboration Engine
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl">
            Automate MEL roster processing, check individual eligibility, and
            generate compliant documents — built for Air Force HR professionals.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/features"
              className="inline-flex items-center gap-2 bg-white text-primary-dark font-bold px-7 py-3.5 rounded-xl hover:bg-gold-light hover:text-primary-dark transition-colors shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Explore Features
            </Link>
            <Link
              to="/how-to"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              How To Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Stat strip ---------- */

interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub: string;
}

const STATS: Stat[] = [
  {
    icon: <Users className="w-5 h-5 text-gold mx-auto mb-1" />,
    value: "—",
    label: "Roster Slots Checked",
    sub: "Total eligibility checks run",
  },
  {
    icon: <FileCheck2 className="w-5 h-5 text-gold mx-auto mb-1" />,
    value: "—",
    label: "PDF Packets Generated",
    sub: "MEL packets produced",
  },
  {
    icon: <Layers className="w-5 h-5 text-gold mx-auto mb-1" />,
    value: "6",
    label: "Promotion Cycles",
    sub: "SSG · TSG · MSG · SMS · CMSgt · CCC",
  },
  {
    icon: <Clock className="w-5 h-5 text-gold mx-auto mb-1" />,
    value: "4–6 hrs",
    label: "Saved Per Cycle",
    sub: "vs. manual MEL processing",
  },
];

function StatStrip() {
  return (
    <div className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="py-2">
              {s.icon}
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-sm font-semibold text-white mt-1">{s.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Section header ---------- */

function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <span className="text-5xl font-black text-slate-100 leading-none select-none">
        {number}
      </span>
      <div className="pt-1">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

/* ---------- Tool card ---------- */

interface ToolCardProps {
  to: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  tag?: string;
  tagColor?: string;
}

function ToolCard({
  to,
  icon,
  iconBg,
  title,
  description,
  tag,
  tagColor,
}: ToolCardProps) {
  return (
    <Link
      to={to}
      className="group flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-200 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
        {tag ? (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColor}`}
          >
            {tag}
          </span>
        ) : null}
      </div>
      <h3 className="font-bold text-slate-900 text-lg mb-1.5 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed flex-1">
        {description}
      </p>
      <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium">
        Open tool{" "}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

/* ---------- Tools (sections 01/02/03) ---------- */

function Tools() {
  return (
    <div className="bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
        <section>
          <SectionHeader
            number="01"
            title="Master Eligibility List"
            subtitle="Upload a roster file and generate promotion board MEL packets as PDF"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ToolCard
              to="/initial-mel"
              icon={<ClipboardCheck className="w-6 h-6 text-primary" />}
              iconBg="bg-primary/10"
              title="Initial MEL"
              description="Upload a member roster to automatically run TIG, TIS, HYT, and AFSC eligibility checks and produce the Initial Master Eligibility Listing."
              tag="Most Used"
              tagColor="bg-primary/10 text-primary"
            />
            <ToolCard
              to="/final-mel"
              icon={<FileCheck2 className="w-6 h-6 text-success" />}
              iconBg="bg-success/10"
              title="Final MEL"
              description="Generate the Final Master Eligibility Listing with senior rater signature block and CUI-compliant PDF output for board submission."
            />
            <ToolCard
              to="/mpf-roster"
              icon={<Layers className="w-6 h-6 text-accent" />}
              iconBg="bg-accent/10"
              title="MPF Roster"
              description="Upload a roster to generate an MPF list, MEL format, or both as a merged PDF."
            />
          </div>
        </section>

        <section>
          <SectionHeader
            number="02"
            title="Eligibility Calculators"
            subtitle="Individual member checks for promotion and Below-the-Zone eligibility"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ToolCard
              to="/calculators/promotion"
              icon={<Calculator className="w-6 h-6 text-special" />}
              iconBg="bg-special/10"
              title="Promotion Eligibility"
              description="Enter a member's DOR and TAFMSD to verify TIG, TIS, and High Year Tenure requirements for any promotion cycle year."
            />
            <ToolCard
              to="/calculators/btz"
              icon={<Calculator className="w-6 h-6 text-gold" />}
              iconBg="bg-gold/10"
              title="BTZ Eligibility"
              description="Determine Below-the-Zone A1C→SRA board quarter, 20-month TIG consideration window, and 36-month TIS exclusion rule."
              tag="A1C → SRA"
              tagColor="bg-gold/10 text-gold"
            />
          </div>
        </section>

        <section>
          <SectionHeader
            number="03"
            title="Document Generation"
            subtitle="Create properly formatted Air Force documents and correspondence"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ToolCard
              to="/memo-generator"
              icon={<FileText className="w-6 h-6 text-accent" />}
              iconBg="bg-accent/10"
              title="Memorandum for Record"
              description="Generate a properly formatted AF MFR per AFH 33-337 (The Tongue and Quill) with correct header, numbered paragraphs, and right-indented signature block."
              tag="New"
              tagColor="bg-accent/10 text-accent"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- Policy / WAPS section (dark) ---------- */

interface Policy {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const POLICIES: Policy[] = [
  {
    icon: <Award className="w-6 h-6 text-gold" />,
    title: "Policy Aligned",
    desc: "Built against current DAFI 36-2502 promotion policy, HYT limits, and TIG/TIS requirements.",
  },
  {
    icon: <Lock className="w-6 h-6 text-gold" />,
    title: "CUI Compliant",
    desc: "PDF outputs include proper CUI headers, footers, and classification markings required for board submission.",
  },
  {
    icon: <Compass className="w-6 h-6 text-gold" />,
    title: "Full Cycle Coverage",
    desc: "Supports SSG, TSG, MSG, SMS, CMSgt, and CCC promotion cycles with per-rank rule sets.",
  },
  {
    icon: <Flag className="w-6 h-6 text-gold" />,
    title: "Discrepancy Flagging",
    desc: "Automatically identifies members requiring manual review with specific reason codes.",
  },
];

function PolicySection() {
  return (
    <div className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-black text-white mb-6">
              Built for the WAPS cycle
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              The Weighted Airman Promotion System (WAPS) governs how Airmen
              compete for promotion to Staff Sergeant through Senior Master
              Sergeant. Central to every cycle is the Master Eligibility List —
              a time-intensive document that requires precise eligibility
              determination for every competing member.
            </p>
            <p className="text-slate-400 leading-relaxed">
              PACE was built to take the manual work out of MEL production:
              upload a roster, get a policy-compliant PDF. What used to take an
              MPF shop 4–6 hours per cycle now takes minutes.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {POLICIES.map((p) => (
              <div
                key={p.title}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <div className="mb-3">{p.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1.5">
                  {p.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Audience cards ---------- */

interface Audience {
  icon: React.ReactNode;
  bg: string;
  role: string;
  desc: string;
  tools: string[];
}

const AUDIENCES: Audience[] = [
  {
    icon: <Building2 className="w-8 h-8 text-primary" />,
    bg: "bg-primary/5 border-primary/20",
    role: "MPF / CSS Shops",
    desc: "Military Personnel Flights and Commander Support Staffs responsible for producing and validating MEL packets for their unit.",
    tools: ["Initial MEL", "Final MEL"],
  },
  {
    icon: <UserCheck className="w-8 h-8 text-special" />,
    bg: "bg-special/5 border-special/20",
    role: "Unit HR & First Sergeants",
    desc: "First Sergeants and unit HR reps who need to verify individual member eligibility before a board or during mid-cycle counseling.",
    tools: ["Promotion Eligibility", "BTZ Eligibility"],
  },
  {
    icon: <Briefcase className="w-8 h-8 text-accent" />,
    bg: "bg-accent/5 border-accent/20",
    role: "Supervisors & Leadership",
    desc: "Flight commanders, superintendents, and supervisors generating official correspondence such as memoranda for record.",
    tools: ["Memorandum for Record"],
  },
];

function Audiences() {
  return (
    <div className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-slate-900 mb-3">
            Who uses PACE?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Designed for the people responsible for managing Air Force
            promotion boards and personnel records
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {AUDIENCES.map((a) => (
            <div key={a.role} className={`rounded-xl border ${a.bg} p-7`}>
              <div className="mb-4">{a.icon}</div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                {a.role}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                {a.desc}
              </p>
              <div className="space-y-1.5">
                {a.tools.map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-2 text-xs text-slate-600"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- WAPS cycle workflow ---------- */

interface Phase {
  phase: string;
  color: string;
  title: string;
  desc: string;
  tool: string;
  toolTo: string;
}

const PHASES: Phase[] = [
  {
    phase: "01",
    color: "bg-primary",
    title: "Eligibility Determination",
    desc: "Unit CSS / MPF runs the initial roster through TIG, TIS, HYT, and AFSC checks to build the Initial MEL.",
    tool: "Initial MEL",
    toolTo: "/initial-mel",
  },
  {
    phase: "02",
    color: "bg-special",
    title: "Individual Verification",
    desc: "Members or supervisors verify individual eligibility dates before the board cutoff using the promotion calculator.",
    tool: "Promotion Eligibility",
    toolTo: "/calculators/promotion",
  },
  {
    phase: "03",
    color: "bg-gold",
    title: "Final Packet Submission",
    desc: "CSS produces the Final MEL with senior rater signature block for submission to the promotion board.",
    tool: "Final MEL",
    toolTo: "/final-mel",
  },
  {
    phase: "04",
    color: "bg-accent",
    title: "Correspondence & Records",
    desc: "Post-board memos, notifications, and records actions are documented with properly formatted MFRs.",
    tool: "Memorandum Generator",
    toolTo: "/memo-generator",
  },
];

function Workflow() {
  return (
    <div className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">
              How a typical WAPS cycle flows
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              WAPS promotion cycles run on an annual calendar. Understanding
              when each phase occurs helps units stay ahead of board submission
              deadlines.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              PACE automates the most labor-intensive step — determining which
              members are eligible — so HR professionals can focus on the parts
              that require human judgement.
            </p>
            <Link
              to="/how-to"
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Read the How To Guide
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {PHASES.map((p) => (
              <div
                key={p.phase}
                className="flex gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              >
                <div
                  className={`${p.color} text-white text-xs font-black w-8 h-8 rounded-lg flex items-center justify-center shrink-0`}
                >
                  {p.phase}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">
                    {p.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-2">
                    {p.desc}
                  </p>
                  <Link
                    to={p.toolTo}
                    className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                  >
                    {p.tool}{" "}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Final CTA ---------- */

function CtaFooter() {
  return (
    <div className="bg-gradient-to-r from-primary-dark to-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        <h2 className="text-3xl font-black text-white mb-3">
          Ready to run your next MEL?
        </h2>
        <p className="text-white/70 mb-8 max-w-lg mx-auto">
          Upload your roster and have a policy-compliant PDF in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/initial-mel"
            className="inline-flex items-center gap-2 bg-white text-primary-dark font-bold px-7 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
          >
            <ClipboardCheck className="w-5 h-5" />
            Start Initial MEL
          </Link>
          <Link
            to="/how-to"
            className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            How To Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
