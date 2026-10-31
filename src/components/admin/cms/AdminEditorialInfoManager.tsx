import React, { useState } from 'react';
import { useJournal } from '../../../context/JournalContext';
import { EditorialMember, AdvisoryBoardMember, Reviewer } from '../../../types';
import { Users, Globe, UserCheck, Plus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';

export const AdminEditorialInfoManager: React.FC = () => {
  const {
    draftContent,
    updateDraftContentText,
    editorialBoard,
    addEditorialMember,
    updateEditorialMember,
    deleteEditorialMember,
    advisoryBoard,
    addAdvisoryMember,
    updateAdvisoryMember,
    deleteAdvisoryMember,
    reviewers,
    addReviewer,
    updateReviewer,
    deleteReviewer,
    acceptReviewer
  } = useJournal();

  const [activeRoster, setActiveRoster] = useState<'editorial' | 'advisory' | 'reviewers'>('editorial');

  // Form states for adding members
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Associate Editor');
  const [newMemberAffiliation, setNewMemberAffiliation] = useState('');
  const [newMemberCountry, setNewMemberCountry] = useState('India');
  const [newMemberExpertise, setNewMemberExpertise] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    if (activeRoster === 'editorial') {
      addEditorialMember({
        name: newMemberName.trim(),
        role: newMemberRole.trim() || 'Associate Editor',
        affiliation: newMemberAffiliation.trim() || 'Academic Institution',
        country: newMemberCountry.trim() || 'India',
        expertise: newMemberExpertise.trim() || 'Social Sciences',
        email: newMemberEmail.trim() || undefined
      });
    } else if (activeRoster === 'advisory') {
      addAdvisoryMember({
        name: newMemberName.trim(),
        role: newMemberRole.trim() || 'International Advisory Member',
        affiliation: newMemberAffiliation.trim() || 'University',
        country: newMemberCountry.trim() || 'United Kingdom',
        expertise: newMemberExpertise.trim() || 'Interdisciplinary Studies',
        email: newMemberEmail.trim() || undefined,
        category: 'international'
      });
    } else {
      addReviewer({
        name: newMemberName.trim(),
        email: newMemberEmail.trim() || 'reviewer@academic.org',
        affiliation: newMemberAffiliation.trim() || 'Research Institute',
        country: newMemberCountry.trim() || 'India',
        track: newMemberExpertise.trim() || 'Social Sciences',
        expertise: newMemberExpertise.trim() || 'Social Sciences',
        status: 'accepted'
      });
    }

    // Reset
    setNewMemberName('');
    setNewMemberAffiliation('');
    setNewMemberExpertise('');
    setNewMemberEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Narrative & Section Header */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3>Editorial Masthead &amp; Board Narrative</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Badge Tag
            </label>
            <input
              type="text"
              value={draftContent.editorial_badge || ''}
              onChange={(e) => updateDraftContentText('editorial_badge', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Page Heading
            </label>
            <input
              type="text"
              value={draftContent.editorial_title || ''}
              onChange={(e) => updateDraftContentText('editorial_title', e.target.value)}
              className="w-full px-3 py-2 text-xs font-serif font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Subtitle
            </label>
            <input
              type="text"
              value={draftContent.editorial_subtitle || ''}
              onChange={(e) => updateDraftContentText('editorial_subtitle', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Board Description
            </label>
            <textarea
              rows={2}
              value={draftContent.editorial_intro || ''}
              onChange={(e) => updateDraftContentText('editorial_intro', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
            />
          </div>
        </div>
      </div>

      {/* 2. Board Rosters Manager */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveRoster('editorial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeRoster === 'editorial'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Editorial Board ({editorialBoard.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRoster('advisory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeRoster === 'advisory'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Advisory Board ({advisoryBoard.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRoster('reviewers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeRoster === 'reviewers'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Reviewers ({reviewers.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>

        {/* Member List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {activeRoster === 'editorial' && (
            editorialBoard.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-850/60 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100">
                    {member.name}
                  </h4>
                  <p className="text-stone-600 dark:text-stone-400">
                    <span className="font-semibold text-sky-700 dark:text-sky-300">{member.role}</span> • {member.affiliation}, {member.country}
                  </p>
                  <p className="text-[11px] text-stone-500 font-serif">Expertise: {member.expertise}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteEditorialMember(member.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition"
                  title="Remove Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}

          {activeRoster === 'advisory' && (
            advisoryBoard.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-850/60 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100">
                    {member.name}
                  </h4>
                  <p className="text-stone-600 dark:text-stone-400">
                    <span className="font-semibold text-amber-700 dark:text-amber-300">{member.role}</span> • {member.affiliation}, {member.country}
                  </p>
                  <p className="text-[11px] text-stone-500 font-serif">Expertise: {member.expertise}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteAdvisoryMember(member.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition"
                  title="Remove Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}

          {activeRoster === 'reviewers' && (
            reviewers.map((rev) => (
              <div
                key={rev.id}
                className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-850/60 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-stone-900 dark:text-stone-100">{rev.name}</h4>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      rev.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rev.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400">
                    {rev.affiliation}, {rev.country} • {rev.email}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {rev.status !== 'accepted' && (
                    <button
                      type="button"
                      onClick={() => acceptReviewer(rev.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition"
                      title="Approve Reviewer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteReviewer(rev.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title="Remove Reviewer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddNew}
            className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 dark:border-stone-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3 border-stone-100 dark:border-stone-800">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Add New {activeRoster === 'editorial' ? 'Editorial Board Member' : activeRoster === 'advisory' ? 'Advisory Board Member' : 'Peer Reviewer'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name with Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Rajesh Kumar, Ph.D."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Role / Designation:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Associate Editor / Senior Reviewer"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Affiliation / Institution:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Department of Sociology, University of Delhi"
                  value={newMemberAffiliation}
                  onChange={(e) => setNewMemberAffiliation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Country:</label>
                  <input
                    type="text"
                    placeholder="e.g. India / United Kingdom"
                    value={newMemberCountry}
                    onChange={(e) => setNewMemberCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email (Optional):</label>
                  <input
                    type="email"
                    placeholder="email@univ.edu"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Areas of Expertise:</label>
                <input
                  type="text"
                  placeholder="e.g. Public Policy, Political Economy, Cultural Studies"
                  value={newMemberExpertise}
                  onChange={(e) => setNewMemberExpertise(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white"
              >
                Save Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
