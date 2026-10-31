import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { EditableText } from './EditableText';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Settings, MessageSquare } from 'lucide-react';

export const ContactView: React.FC = () => {
  const { setActiveTab, setAdminActiveSubTab, isAdmin, content } = useJournal();
  const [formSent, setFormSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 6000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-3 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest">
            <Mail className="w-4 h-4" />
            <span>
              <EditableText id="contact_badge" placeholder="Editorial Office" />
            </span>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setAdminActiveSubTab('contact-cms' as any);
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1c355e] hover:bg-[#23467d] text-white shadow-xs cursor-pointer transition w-fit"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Contact Info in CMS</span>
            </button>
          )}
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
          <EditableText id="contact_title" placeholder="Editorial Secretariat & Inquiries" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
          <EditableText id="contact_subtitle" placeholder="Contact our editorial office for editorial inquiries, submission status questions, and academic partnerships" />
        </p>
      </motion.div>

      {/* Two-column Layout: Contact Details & Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-6 transition-colors"
        >
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-2">
            Official Secretarial Details
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1c355e] dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-900">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-stone-500 uppercase text-[10px]">Primary Editorial Email:</span>
                <div className="font-medium text-stone-800 dark:text-stone-200 text-sm mt-0.5 font-mono">
                  <EditableText id="contact_email" placeholder="editorial@contemporaryhorizons.org" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1c355e] dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-900">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-stone-500 uppercase text-[10px]">Secretariat Phone:</span>
                <div className="font-medium text-stone-800 dark:text-stone-200 text-sm mt-0.5 font-mono">
                  <EditableText id="contact_phone" placeholder="+44 (0) 131 650 1000" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1c355e] dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-900">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-stone-500 uppercase text-[10px]">Postal & Editorial Office:</span>
                <div className="font-medium text-stone-800 dark:text-stone-200 text-xs mt-0.5 leading-relaxed font-serif">
                  <EditableText id="contact_office" multiline placeholder="Chrystal Macmillan Building, George Square, Edinburgh EH8 9LD, United Kingdom" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1c355e] dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-900">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-stone-500 uppercase text-[10px]">Office Hours & Response:</span>
                <div className="font-medium text-stone-800 dark:text-stone-200 text-xs mt-0.5 font-serif">
                  <EditableText id="contact_hours" placeholder="Monday – Friday: 09:00 – 17:00 GMT" />
                </div>
                <div className="text-[11px] text-stone-500 mt-1 italic">
                  <EditableText id="contact_response_time" placeholder="Our editorial secretariat responds to all inquiries within 2 business days." />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
            <EditableText id="contact_instructions" multiline placeholder="For manuscript queries, please include your submission tracking ID (e.g., CHSSH-2026-XXXX) in the subject line to ensure prompt routing to the managing editor." />
          </div>
        </motion.div>

        {/* Inquiries Message Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-4 transition-colors"
        >
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
            <MessageSquare className="w-4 h-4 text-[#1c355e] dark:text-sky-400" />
            <span>Send Secretarial Inquiry</span>
          </h2>

          {formSent ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <div className="font-serif font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                Inquiry Transmitted Successfully
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Thank you for contacting the CHSSH Editorial Office. A member of the secretariat will respond to your registered email address promptly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Full Name / Academic Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Emily Thorne"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#1c355e]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Institutional Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@university.edu"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#1c355e]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Subject / Manuscript Tracking ID
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Query on CHSSH-2026-3915"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#1c355e]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Message / Inquiries *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="State your question or inquiry clearly..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#1c355e] leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message to Secretariat</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
