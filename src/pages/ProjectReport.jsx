import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, CheckCircle2, Layout, Database, Shield, Zap, Sparkles, Code2, Users, BookOpen } from 'lucide-react';

// This component is designed for A4 printing.
// We use 'print:hidden' classes for UI elements that shouldn't appear in the PDF.

export default function ProjectReport() {
  const reportRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { id: 'certificate', title: '1. Certificate', icon: <FileText className="w-5 h-5" /> },
    { id: 'preface', title: '2. Preface', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'ack', title: '3. Acknowledgement', icon: <Users className="w-5 h-5" /> },
    { id: 'objective', title: '4. Objective', icon: <Zap className="w-5 h-5" /> },
    { id: 'architecture', title: '8. System Architecture', icon: <Layout className="w-5 h-5" /> },
    { id: 'database', title: '11. Database Design', icon: <Database className="w-5 h-5" /> },
    { id: 'security', title: '13. Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'testing', title: '16. Testing', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 print:p-0 print:bg-white">
      {/* Print Button - Hidden on Print */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <div className="flex items-center space-x-3 text-gray-600">
          <BookOpen className="w-6 h-6 text-pink-600" />
          <h1 className="text-xl font-black uppercase tracking-widest italic">Project Documentation</h1>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-pink-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-200"
        >
          <Download className="w-5 h-5" />
          <span>Export to PDF</span>
        </button>
      </div>

      {/* Main Report Container */}
      <div 
        ref={reportRef}
        className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-[297mm] p-[20mm] font-serif text-gray-800 leading-relaxed"
      >
        
        {/* TITLE PAGE */}
        <section className="min-h-[250mm] flex flex-col items-center justify-center text-center border-[8px] border-double border-pink-600 p-12 mb-12 page-break-after">
          <div className="mb-12">
            <h4 className="text-xl font-bold text-gray-600 uppercase tracking-[0.2em] mb-2">Department of Computer Science</h4>
            <p className="text-lg font-medium text-gray-500 uppercase tracking-widest">Bachelor of Computer Applications (BCA) - Final Year</p>
            <p className="text-sm text-gray-400 mt-2">Academic Session: 2025 - 2026</p>
          </div>

          <div className="w-32 h-32 mb-8 p-4 bg-pink-50 rounded-full flex items-center justify-center">
            <img src="/logo.svg" alt="Project Logo" className="w-full h-full object-contain" />
          </div>

          <h1 className="text-6xl font-black text-pink-700 tracking-tighter uppercase mb-2">Gathbandhan</h1>
          <h2 className="text-2xl font-medium text-gray-500 italic mb-12">Celestial Wedding Planner</h2>

          <p className="max-w-lg text-lg text-gray-600 mb-16 leading-relaxed">
            A Full-Stack Web Application | React 19 + Firebase + Google Gemini AI + Express.js
          </p>

          <div className="grid grid-cols-2 gap-8 w-full max-w-2xl text-left border-t border-gray-100 pt-12">
            <div className="space-y-4">
              <p><span className="font-bold text-gray-900 block text-xs uppercase tracking-widest opacity-50 mb-1">Submitted By</span> <span className="text-lg font-bold">Manish</span></p>
              <p><span className="font-bold text-gray-900 block text-xs uppercase tracking-widest opacity-50 mb-1">Programme</span> <span className="text-lg font-bold">BCA - Final Year</span></p>
            </div>
            <div className="space-y-4">
              <p><span className="font-bold text-gray-900 block text-xs uppercase tracking-widest opacity-50 mb-1">Project Title</span> <span className="text-lg font-bold text-pink-600">Gathbandhan</span></p>
              <p><span className="font-bold text-gray-900 block text-xs uppercase tracking-widest opacity-50 mb-1">Submission Date</span> <span className="text-lg font-bold">May 2026</span></p>
            </div>
          </div>
        </section>

        {/* TABLE OF CONTENTS */}
        <section className="min-h-[250mm] py-12 page-break-after">
          <h3 className="text-3xl font-black uppercase tracking-widest italic text-pink-700 mb-12 text-center underline decoration-pink-200 underline-offset-8">Table of Contents</h3>
          <div className="space-y-6 max-w-2xl mx-auto">
            {sections.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-dotted border-gray-300 pb-2">
                <span className="text-lg font-bold text-gray-700 flex items-center">
                  <span className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3 text-pink-600 text-xs font-black">0{idx + 1}</span>
                  {s.title}
                </span>
                <span className="text-gray-400 font-mono">P. {idx + 3}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-b border-dotted border-gray-300 pb-2">
              <span className="text-lg font-bold text-gray-700 flex items-center">
                <span className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3 text-pink-600 text-xs font-black">09</span>
                Gallery (Screenshots)
              </span>
              <span className="text-gray-400 font-mono">P. 12</span>
            </div>
          </div>
        </section>

        {/* 1. CERTIFICATE */}
        <section className="min-h-[250mm] py-12 page-break-after" id="certificate">
          <div className="border-[4px] border-pink-700 p-12 text-center">
            <h3 className="text-4xl font-black uppercase italic mb-12">Certificate</h3>
            <p className="text-xl leading-[2] mb-12 italic text-gray-700">
              This is to certify that the project entitled <span className="font-bold text-pink-600">"GATHBANDHAN: A Celestial Wedding Planner"</span> is a record of 
              bonafide work carried out by <span className="font-bold underline">Manish</span> under the guidance of the faculty 
              for the partial fulfillment of the degree of <span className="font-bold">Bachelor of Computer Applications (BCA)</span>. 
              The software and documentation are original results of the candidate's own efforts.
            </p>
            
            <div className="grid grid-cols-3 gap-8 mt-24 pt-12 border-t border-gray-100">
              <div className="flex flex-col items-center">
                <div className="w-32 border-b border-gray-900 mb-2"></div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Internal Examiner</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-32 border-b border-gray-900 mb-2"></div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">External Examiner</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-32 border-b border-gray-900 mb-2"></div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Principal / HOD</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PREFACE & ACKNOWLEDGEMENT */}
        <section className="min-h-[250mm] py-12 page-break-after" id="preface">
          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-widest italic text-pink-700 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-3" />
                Preface
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                In the vibrant tapestry of Indian culture, a wedding is not just a union of two individuals but a cosmic event 
                involving families, traditions, and the alignment of stars. Yet modern couples face overwhelming fragmentation 
                — scattered WhatsApp groups, paper notes, spreadsheets, and endless vendor calls. 
                <br /><br />
                Gathbandhan is built to solve this. By merging ancient Vedic Astrology with modern SaaS principles, 
                it delivers a single, intelligent, culturally rich digital platform for every stage of Indian wedding planning.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-black uppercase tracking-widest italic text-pink-700 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3" />
                Acknowledgement
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                I express sincere gratitude to my project guide and faculty for their continuous mentorship and support throughout 
                the development of this system. I am grateful to the Google AI Studio environment for Gemini AI access, 
                Firebase team for their real-time database infrastructure, and the React/Vite open-source community. 
                Special thanks to my family and friends who participated in user-experience surveys to refine the platform's 
                mobile interface.
              </p>
            </div>
          </div>
        </section>

        {/* 4. OBJECTIVE */}
        <section className="min-h-[250mm] py-12 page-break-after" id="objective">
          <h3 className="text-2xl font-black uppercase tracking-widest italic text-pink-700 mb-8 flex items-center">
            <Zap className="w-6 h-6 mr-3" />
            4. Objective
          </h3>
          
          <div className="bg-pink-50 p-8 rounded-3xl mb-8 border border-pink-100 italic font-medium text-pink-900">
            "Replace fragmented, manual Indian wedding planning with an efficient, scalable, and culturally authentic 
            digital platform — integrating AI automation, real-time data, vendor marketplace, astrological tools, 
            and digital invitations as a single deployable solution."
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-black uppercase tracking-widest text-xs text-gray-500 mb-4">Primary Objectives</h4>
              <ul className="space-y-3">
                {[
                  'Centralized digital platform for couples',
                  'Vendor marketplace for listing & bookings',
                  'AI-powered invitation copywriter',
                  'Vedic Astrology (Gun-Milap) scoring',
                  'Real-time admin control panel',
                  'Role-Based Access Control (RBAC)',
                  'Automated email notifications'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-700">
                    <span className="w-4 h-4 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-[10px] mr-3 mt-0.5">✔</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black uppercase tracking-widest text-xs text-gray-500 mb-4">Secondary Objectives</h4>
              <ul className="space-y-3">
                {[
                  'Reduce administrative overhead',
                  'Demonstrate full-stack React capabilities',
                  'Production-ready modular code',
                  'Scalable NoSQL architecture',
                  'High-fidelity responsive UI'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-700">
                    <span className="w-4 h-4 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-[10px] mr-3 mt-0.5">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 8. ARCHITECTURE */}
        <section className="min-h-[250mm] py-12 page-break-after" id="architecture">
          <h3 className="text-2xl font-black uppercase tracking-widest italic text-pink-700 mb-8 flex items-center">
            <Layout className="w-6 h-6 mr-3" />
            8. System Architecture
          </h3>

          <div className="space-y-8">
            <div className="relative border-l-4 border-pink-100 pl-8 space-y-8">
              {[
                { title: 'Presentation Tier', tech: 'React 19 + Vite + Tailwind CSS', desc: 'Renders UI, collects form input, handles SPA routing and page transitions via Framer Motion.' },
                { title: 'Business Logic Tier', tech: 'Express.js + React Hooks', desc: 'Validates roles, manages AI calls to Gemini 2.0 Flash, and proxies Resend API emails.' },
                { title: 'Data Tier', tech: 'Firebase Firestore + Real-time Sync', desc: 'NoSQL document storage for users, services, bookings, and invitations with cross-collection integrity.' }
              ].map((tier, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[40px] top-0 w-8 h-8 bg-pink-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-pink-200">
                    {idx + 1}
                  </div>
                  <h4 className="font-black text-gray-900 mb-1">{tier.title}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-pink-600 mb-2">{tier.tech}</p>
                  <p className="text-sm text-gray-600">{tier.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-gray-900 rounded-3xl text-white">
              <h4 className="font-black uppercase tracking-widest text-[10px] text-pink-400 mb-6">File & Directory Structure</h4>
              <div className="grid grid-cols-2 gap-4 text-[11px] font-mono opacity-80">
                <div>/src/pages/</div> <div className="text-pink-400">Main Route Components</div>
                <div>/src/components/</div> <div className="text-pink-400">Reusable Atomic UI</div>
                <div>/src/lib/</div> <div className="text-pink-400">Firebase & AI Service Config</div>
                <div>/server.js</div> <div className="text-pink-400">Express API Gateway</div>
                <div>/firestore.rules</div> <div className="text-pink-400">Security Access Policy</div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. DATABASE & DATA DICTIONARY */}
        <section className="min-h-[250mm] py-12 page-break-after" id="database">
          <h3 className="text-2xl font-black uppercase tracking-widest italic text-pink-700 mb-8 flex items-center">
            <Database className="w-6 h-6 mr-3" />
            11. Database Design
          </h3>

          <div className="overflow-hidden border border-gray-100 rounded-3xl mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 uppercase tracking-widest text-[10px] font-black text-gray-500">
                <tr>
                  <th className="p-4">Collection</th>
                  <th className="p-4">Role / Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { name: 'users', role: 'Identity management, roles (admin/vendor/user), PII data.' },
                  { name: 'services', role: 'Vendor service catalog, pricing, category metadata.' },
                  { name: 'bookings', role: 'Relational mapping between customers and service providers.' },
                  { name: 'invitations', role: 'Digital card templates, personalization strings, RSVP links.' },
                  { name: 'guest_list', role: 'Individual guest metadata, RSVP status, relationships.' }
                ].map((c, i) => (
                  <tr key={i}>
                    <td className="p-4 font-black font-mono text-pink-600">/{c.name}</td>
                    <td className="p-4 text-gray-600">{c.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-6">Security Rule Excerpt (Zero-Trust)</h4>
          <div className="bg-gray-50 p-6 rounded-2xl font-mono text-[10px] text-gray-600 border border-gray-100">
            <pre>{`match /{document=**} {
  allow read, write: if request.auth != null;
}

match /invitations/{id} {
  allow update: if (isOwner(existing().userId) || isAdmin()) && 
                isValidInvitation(incoming());
}`}</pre>
          </div>
        </section>

        {/* GALLERY / SCREENSHOTS SECTION */}
        <section className="min-h-[250mm] py-12" id="gallery">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black uppercase tracking-[0.2em] italic text-pink-700 mb-4 underline decoration-pink-200 underline-offset-8">UI Gallery</h3>
            <p className="text-gray-500 font-medium tracking-widest uppercase text-xs">Visual Verification of Production Implementation</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {[
              { title: 'Home Page', desc: 'Hero section with celestial taglines' },
              { title: 'Vendor Directory', desc: 'Category-filtered marketplace' },
              { title: 'Astro Reading', desc: 'AI-generated Vedic compatibility report' },
              { title: 'Invitation Designer', desc: 'Royal template preview mode' },
              { title: 'Guest Management', desc: 'Bulk invitation delivery tracking' },
              { title: 'Admin Control', desc: 'System-wide analytics and access' },
            ].map((page, idx) => (
              <div key={idx} className="border-2 border-dashed border-gray-200 rounded-3xl p-4 flex flex-col items-center justify-center min-h-[140mm] bg-gray-50/50">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                  <Layout className="w-8 h-8 text-pink-300" />
                </div>
                <h4 className="font-black uppercase tracking-widest text-gray-900 mb-2">{page.title}</h4>
                <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-6 opacity-60">{page.desc}</p>
                <div className="w-full h-48 bg-white/80 rounded-2xl border border-gray-100 flex items-center justify-center text-[10px] font-mono text-gray-300 uppercase tracking-[0.3em]">
                  [ Paste Screenshot Here ]
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer for Report */}
        <div className="mt-12 text-center pt-12 border-t border-gray-100 pb-12">
          <img src="/logo.svg" alt="Gathbandhan" className="w-8 h-8 mx-auto mb-4 grayscale opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Gathbandhan Project Documentation | Internal Use Only</p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            padding: 0 !important;
          }
          .page-break-after {
            page-break-after: always;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}} />
    </div>
  );
}
