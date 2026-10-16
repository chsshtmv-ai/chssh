import React, { useState } from 'react';
import { EditorialMember } from '../../types';
import {
  Plus,
  Edit3,
  Trash2,
  Mail,
  Search,
  X,
  ShieldCheck,
  Building
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';
import { getInitials, getAvatarColor } from '../../utils/imageUtils';

interface AdminEditorialBoardProps {
  editorialBoard: EditorialMember[];
  addEditorialMember: (member: Omit<EditorialMember, 'id'>) => void;
  updateEditorialMember: (id: string, member: Partial<EditorialMember>) => void;
  deleteEditorialMember: (id: string) => void;
}

export const AdminEditorialBoard: React.FC<AdminEditorialBoardProps> = ({
  editorialBoard,
  addEditorialMember,
  updateEditorialMember,
  deleteEditorialMember
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<EditorialMember | null>(null);

  const [newMember, setNewMember] = useState<Omit<EditorialMember, 'id'>>({
    name: '',
    role: 'Associate Editor',
    affiliation: '',
    country: '',
    expertise: '',
    email: '',
    imageUrl: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const filteredMembers = editorialBoard.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.role.toLowerCase().includes(term) ||
      m.affiliation.toLowerCase().includes(term) ||
      m.country.toLowerCase().includes(term) ||
      m.expertise.toLowerCase().includes(term) ||
      (m.email && m.email.toLowerCase().includes(term))
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.role.trim() || !newMember.affiliation.trim()) {
      setFormError('Please provide at least Name, Editorial Role, and Affiliation.');
      return;
    }
    addEditorialMember(newMember);
    setNewMember({
      name: '',
      role: 'Associate Editor',
      affiliation: '',
      country: '',
      expertise: '',
      email: '',
      imageUrl: ''
    });
    setFormError(null);
    setShowAddForm(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editingMember.name.trim() || !editingMember.role.trim()) {
      alert('Name and Role are required.');
      return;
    }
    updateEditorialMember(editingMember.id, {
      name: editingMember.name,
      role: editingMember.role,
      affiliation: editingMember.affiliation,
      country: editingMember.country,
      expertise: editingMember.expertise,
      email: editingMember.email,
      imageUrl: editingMember.imageUrl
    });
    setEditingMember(null);
  };

  const commonRoles = [
    'Editor-in-Chief',
    'Senior Associate Editor',
    'Associate Editor',
    'Section Editor (Social Sciences)',
    'Section Editor (Humanities)',
    'Associate Editor (Digital Humanities)',
    'Book Review & Special Issues Editor',
    'Advisory Council Member',
    'Managing Editor & Production Director'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1c355e] dark:text-sky-400 uppercase tracking-widest font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Governance & Scientific Integrity</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Editorial Board & Council Management
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl font-serif">
            Appoint new editorial members, modify affiliations and disciplinary roles, or curate the advisory council displayed on the public site.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setFormError(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1c355e] hover:bg-[#102344] dark:bg-[#23467d] dark:hover:bg-[#1c355e] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer shrink-0 border border-[#102344]"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancel New Member' : 'Add Board Member'}</span>
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white dark:bg-stone-900 p-6 rounded-2xl border-2 border-[#1c355e]/30 dark:border-sky-500/40 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 transition-colors"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1c355e] dark:text-sky-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Appoint New Board Member
            </h4>
            <span className="text-[11px] text-slate-500">Will be saved to Firestore database</span>
          </div>
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-lg">
              {formError}
            </div>
          )}
          <div className="bg-slate-50/80 dark:bg-slate-850/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <ImageUploadField
              label="Editorial Board Member Photo / Portrait"
              value={newMember.imageUrl || ''}
              personName={newMember.name}
              onChange={(imgUrl) => setNewMember({ ...newMember, imageUrl: imgUrl })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name & Honorifics <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="e.g. Prof. Dr. Julian Vance, Ph.D."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Editorial Role <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-slate-500">Preset or custom</span>
              </div>
              <input
                type="text"
                required
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                placeholder="e.g. Associate Editor"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {commonRoles.slice(0, 4).map((rolePreset) => (
                  <button
                    key={rolePreset}
                    type="button"
                    onClick={() => setNewMember({ ...newMember, role: rolePreset })}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    {rolePreset}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                University / Institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newMember.affiliation}
                onChange={(e) => setNewMember({ ...newMember, affiliation: e.target.value })}
                placeholder="e.g. University of Edinburgh"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={newMember.country}
                onChange={(e) => setNewMember({ ...newMember, country: e.target.value })}
                placeholder="e.g. United Kingdom"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email (Optional)
              </label>
              <input
                type="email"
                value={newMember.email || ''}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="e.g. j.vance@ed.ac.uk"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fields of Research Expertise
              </label>
              <input
                type="text"
                value={newMember.expertise}
                onChange={(e) => setNewMember({ ...newMember, expertise: e.target.value })}
                placeholder="e.g. Epistemic Justice, Critical Theory, Qualitative Methods"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#1c355e] hover:bg-[#102344] dark:bg-[#23467d] dark:hover:bg-[#1c355e] rounded-lg shadow-xs cursor-pointer transition"
            >
              Save Member to Board
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, role, university, country, or expertise..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-[#1c355e] text-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Showing <strong className="text-slate-900 dark:text-slate-100">{filteredMembers.length}</strong> of {editorialBoard.length} members
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMembers.map((member) => {
          const colors = getAvatarColor(member.name);
          const initials = getInitials(member.name);
          return (
            <div
              key={member.id}
              className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs space-y-3 relative group hover:border-[#1c355e]/40 dark:hover:border-sky-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-[#1c355e]/30 dark:border-sky-500/40 shadow-xs bg-stone-100 dark:bg-stone-800"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center font-serif font-bold text-base sm:text-lg border ${colors.bg} ${colors.text} ${colors.border} shadow-2xs`}
                      >
                        <span>{initials}</span>
                        <span className="text-[9px] uppercase tracking-tighter opacity-70 font-sans font-medium">Scholar</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {member.name}
                    </h4>
                    <div className="text-xs font-semibold text-[#1c355e] dark:text-sky-400">
                      {member.role}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingMember(member)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1c355e] dark:text-sky-300 bg-sky-50 dark:bg-[#102344]/80 hover:bg-sky-100 dark:hover:bg-[#1c355e] border border-sky-200 dark:border-sky-800 rounded-md transition cursor-pointer"
                    title="Modify this board member's details & photo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modify</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove "${member.name}" from the Editorial Board?`)) {
                        deleteEditorialMember(member.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition cursor-pointer"
                    title="Remove from board"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{member.affiliation}{member.country ? `, ${member.country}` : ''}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 leading-relaxed font-sans">
                <strong className="text-slate-900 dark:text-slate-200 font-semibold">Specialization: </strong>
                {member.expertise}
              </div>
              {member.email && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{member.email}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-[#102344] text-white p-5 flex items-center justify-between border-b border-[#1c355e] shrink-0">
              <div>
                <span className="text-[11px] font-mono text-sky-400 uppercase tracking-widest font-semibold">
                  Board Modification
                </span>
                <h3 className="font-serif text-lg font-bold text-white mt-0.5">
                  Modify Member &amp; Photo: {editingMember.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="bg-slate-50/80 dark:bg-slate-850/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <ImageUploadField
                  label="Profile Portrait / Photo"
                  value={editingMember.imageUrl || ''}
                  personName={editingMember.name}
                  onChange={(imgUrl) => setEditingMember({ ...editingMember, imageUrl: imgUrl })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name &amp; Honorifics <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Editorial Role <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Preset or custom</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {commonRoles.slice(0, 4).map((rolePreset) => (
                      <button
                        key={rolePreset}
                        type="button"
                        onClick={() => setEditingMember({ ...editingMember, role: rolePreset })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                      >
                        {rolePreset}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    value={editingMember.email || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    University / Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.affiliation}
                    onChange={(e) => setEditingMember({ ...editingMember, affiliation: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={editingMember.country}
                    onChange={(e) => setEditingMember({ ...editingMember, country: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fields of Research Expertise
                  </label>
                  <textarea
                    rows={3}
                    value={editingMember.expertise}
                    onChange={(e) => setEditingMember({ ...editingMember, expertise: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1c355e] hover:bg-[#102344] dark:bg-[#23467d] dark:hover:bg-[#1c355e] rounded-lg shadow-xs cursor-pointer transition"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
