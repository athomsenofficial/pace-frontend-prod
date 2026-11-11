import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/air_force_no_bg_navy.png"
                alt="USAF"
                className="h-8 w-auto"
              />
              <span className="font-brand text-2xl text-white tracking-wider">
                PACE
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Personnel & Administrative Collaboration Engine — automate USAF
              promotion processing.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">MEL Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/initial-mel" className="hover:text-white">Initial MEL</Link></li>
              <li><Link to="/final-mel" className="hover:text-white">Final MEL</Link></li>
              <li><Link to="/mpf-roster" className="hover:text-white">MPF Roster</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Calculators</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/calculators/promotion" className="hover:text-white">Promotion Eligibility</Link></li>
              <li><Link to="/calculators/btz" className="hover:text-white">BTZ Eligibility</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="hover:text-white">Features</Link></li>
              <li><Link to="/how-to" className="hover:text-white">How-To Guide</Link></li>
              <li><Link to="/memo-generator" className="hover:text-white">Memorandum Generator</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-800 mt-8 pt-6 text-xs text-slate-400 flex flex-col md:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} PACE System. Built for Air Force HR professionals.</p>
          <p>For Official Use Only — handle in accordance with DoDM 5200.01.</p>
        </div>
      </div>
    </footer>
  );
}
