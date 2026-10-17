import React from 'react';
import { UserProfile } from '../../types';
import { Building2, Users, ShieldCheck, DollarSign, Briefcase, FileCheck, Award, Lock, Activity } from 'lucide-react';

interface CompanyDashboardProps {
  user: UserProfile;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ user }) => {
  const departments = [
    { name: 'Civil & Structural Engineering', lead: 'Eng. Martin Vance, PE', headcount: 34, projects: 8 },
    { name: 'Geotechnical & Foundations', lead: 'Eng. David Kiptoo, CE', headcount: 18, projects: 5 },
    { name: 'MEP & Environmental Systems', lead: 'Eng. S. Lin, SE', headcount: 22, projects: 6 },
    { name: 'HSE & Site Safety Management', lead: 'Safety Dir. J. Mwangi', headcount: 14, projects: 8 },
    { name: 'Quantity Surveying & Commercial', lead: 'QS Dir. A. Sterling', headcount: 16, projects: 8 },
  ];

  const employees = [
    { name: 'Eng. Martin Vance, PE', role: 'Chief Structural Engineer & Director', license: 'PE #78492 (Civil/Structural)', status: 'Active' },
    { name: 'Eng. Sophia Lin, SE', role: 'Senior High-Rise Structural Specialist', license: 'SE #49102 (Structural)', status: 'Active' },
    { name: 'Eng. David Kiptoo, CE', role: 'Lead Geotechnical & Piling Engineer', license: 'CE #90214 (Geotechnical)', status: 'Active' },
    { name: 'Eng. Sarah Jenkins, PE', role: 'Lead QA/QC & Materials Testing', license: 'PE #88210 (Materials)', status: 'Active' },
  ];

  const auditLogs = [
    { id: 'log-01', user: 'Eng. Martin Vance', action: 'Approved Decision #42 (Slab Thickness 250mm)', time: 'Today 08:30 AM', ip: '10.200.4.12' },
    { id: 'log-02', user: 'Eng. Sophia Lin', action: 'Uploaded Drawing S-101 Rev 3 for Apex Tower', time: 'Yesterday 04:15 PM', ip: '10.200.4.18' },
    { id: 'log-03', user: 'System Auditor', action: 'Verified Single Source Asset Hash Integrity (100% Pass)', time: 'Yesterday 02:00 PM', ip: 'Internal Auto-Audit' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Company Executive Portal & Department Memory</span>
          </div>
          <h2 className="text-xl font-bold">{user.company}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Enterprise resource management, licensed engineering workforce, department governance & security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-mono font-bold">
            104 Licensed Employees
          </span>
        </div>
      </div>

      {/* Executive Financial & Portfolio Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">ACTIVE PORTFOLIO VALUE</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">$51.4M</div>
          <p className="text-[10px] text-emerald-500 font-semibold font-mono">3 Active Mega Projects</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">LICENSED ENGINEERS</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">104 PE/SE</div>
          <p className="text-[10px] text-emerald-500 font-semibold font-mono">100% Verified Credentials</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">HSE SAFETY INCIDENT RATE</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">0.00</div>
          <p className="text-[10px] text-slate-400 font-mono">Zero Loss Time Incidents</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">SINGLE TRUTH AUDIT SCORE</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">100%</div>
          <p className="text-[10px] text-emerald-500 font-semibold font-mono">Zero Duplicate Files</p>
        </div>
      </div>

      {/* Departments & Workforce */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Departments List */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Company Departments & Active Headcount
          </h3>

          <div className="space-y-3">
            {departments.map((dep, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{dep.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Department Lead: {dep.lead}</p>
                </div>

                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span>{dep.headcount} Engineers</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    {dep.projects} Projects
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Licensed Engineers Directory */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Engineering License Roster
          </h3>

          <div className="space-y-3 text-xs">
            {employees.map((emp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1"
              >
                <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{emp.role}</div>
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
                  {emp.license}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Audit Logs */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Platform Governance & Security Audit Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="p-2">User / Actor</th>
                <th className="p-2">Audit Action</th>
                <th className="p-2">Timestamp</th>
                <th className="p-2">IP / Node</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                  <td className="p-2 font-bold text-slate-900 dark:text-white">{log.user}</td>
                  <td className="p-2">{log.action}</td>
                  <td className="p-2 text-slate-400">{log.time}</td>
                  <td className="p-2 text-slate-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
