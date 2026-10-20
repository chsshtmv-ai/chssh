import React, { useState } from 'react';
import { AdvisoryBoardMember, AdvisoryCategory } from '../../types';
import {
  GraduationCap,
  Plus,
  Edit3,
  Trash2,
  Search,
  Check,
  X,
  Building
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';
import { getInitials, getAvatarColor } from '../../utils/imageUtils';

interface AdminAdvisoryBoardProps {
  advisoryBoard: AdvisoryBoardMember[];
  addAdvisoryMember: (member: Omit<AdvisoryBoardMember, 'id'>) => void;
  updateAdvisoryMember: (id: string, member: Partial<AdvisoryBoardMember>) => void;
  deleteAdvisoryMember: (id: string) => void;
}

export const AdminAdvisoryBoard: React.FC<AdminAdvisoryBoardProps> = ({
  advisoryBoard,
  addAdvisoryMember,
  updateAdvisoryMember,
  deleteAdvisoryMember
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<AdvisoryBoardMember | null>(null);

  const [newMember, setNewMember] = useState<Omit<AdvisoryBoardMember, 'id'>>({
    name: '',
    role: 'International Advisory Board Member',
    affiliation: '',
    country: '',
    expertise: '',
    email: '',
    imageUrl: '',
    orcid: '',
    bio: '',
    category: 'international'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const filteredMembers = advisoryBoard.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(term) ||
      m.role.toLowerCase().includes(term) ||
      m.affiliation.toLowerCase().includes(term) ||
      m.country.toLowerCase().includes(term) ||
      m.expertise.toLowerCase().includes(term) ||
      (m.email && m.email.toLowerCase().includes(term));
    const matchesCategory =
      categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.role.trim() || !newMember.affiliation.trim()) {
      setFormError('Please provide at least Name, Advisory Role, and Institutional Affiliation.');
      return;
    }
    addAdvisoryMember(newMember);
    setNewMember({
      name: '',
      role: 'International Advisory Board Member',
      affiliation: '',
      country: '',
      expertise: '',
      email: '',
      imageUrl: '',
      orcid: '',
      bio: '',
      category: 'international'
    });
    setFormError(null);
    setShowAddModal(false);
    showToast('New Advisory Board member added successfully!');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editingMember.name.trim() || !editingMember.role.trim()) {
      alert('Name and Advisory Role are required.');
      return;
    }
    updateAdvisoryMember(editingMember.id, {
      name: editingMember.name,
      role: editingMember.role,
      affiliation: editingMember.affiliation,
      country: editingMember.country,
      expertise: editingMember.expertise,
      email: editingMember.email,
      imageUrl: editingMember.imageUrl,
      orcid: editingMember.orcid,
      bio: editingMember.bio,
      category: editingMember.category
    });
    setEditingMember(null);
    showToast('Advisory Board member updated successfully!');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the Advisory Board?`)) {
      deleteAdvisoryMember(id);
      showToast(`Removed "${name}" from Advisory Board.`);
    }
  };

  const commonRoles = [
    'Chair of International Advisory Board',
    'Senior Scientific Advisor',
    'International Advisory Board Member',
    'Advisory Council Member (Critical Theory)',
    'Advisory Member (Latin American Studies)',
    'Scientific Advisor (Environmental Humanities)',
    'Advisory Member (Middle Eastern Historiography)',
    'Distinguished Honorary Advisor',
    'Ethics & Open Science Advisor'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-widest font-mono">
            <GraduationCap className="w-4 h-4" />
            <span>Advisory Council CMS</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
            International Advisory Board Administration
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-2xl font-serif">
            Manage the distinguished international scholars, academic council members, and honorary fellows listed on the public website. Changes sync in real-time across Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-sky-300" />
            <span>Add Advisory Member</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 shadow-xs animate-in fade-in duration-200 font-medium">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'international', 'scientific', 'honorary', 'policy'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#1c355e] text-white font-bold shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {cat === 'all' ? 'All Members' : cat}
            </button>
          ))}
        </div>
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter advisors by name, institution..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-1 focus:ring-[#1c355e]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMembers.map((member) => {
          const colors = getAvatarColor(member.name);
          const initials = getInitials(member.name);
          return (
            <div
              key={member.id}
              className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xs space-y-3 hover:shadow-xs transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shadow-2xs bg-stone-100 dark:bg-stone-800"
                        />
                      ) : (
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center font-serif font-bold text-base border ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          <span>{initials}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 uppercase font-semibold">
                        {member.category || 'International'}
                      </span>
                      <h4 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
                        {member.name}
                      </h4>
                      <div className="text-xs font-semibold text-[#1c355e] dark:text-sky-400">
                        {member.role}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1">
                        <Building className="w-3 h-3 text-stone-400" />
                        <span>{member.affiliation}, {member.country}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingMember(member)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition cursor-pointer"
                      title="Edit member"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(member.id, member.name)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition cursor-pointer"
                      title="Delete member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
                  <span className="font-bold text-stone-700 dark:text-stone-300">Expertise: </span>
                  {member.expertise}
                </div>
                {member.bio && (
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-serif italic line-clamp-2">
                    &ldquo;{member.bio}&rdquo;
                  </p>
                )}
              </div>
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                <span>ORCID: {member.orcid || 'N/A'}</span>
                <span>{member.email || 'No public email'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-850">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#1c355e] dark:text-sky-400" />
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  Add New Advisory Board Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Full Name &amp; Academic Titles *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="e.g. Prof. Dr. Aris Thorne, FBA"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Council Category
                  </label>
                  <select
                    value={newMember.category || 'international'}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        category: e.target.value as AdvisoryCategory
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  >
                    <option value="international">International Board</option>
                    <option value="scientific">Scientific Council</option>
                    <option value="honorary">Honorary Fellow</option>
                    <option value="policy">Policy &amp; Ethics</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Advisory Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    list="advisory-roles-list"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    placeholder="e.g. Senior Scientific Advisor"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                  <datalist id="advisory-roles-list">
                    {commonRoles.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Institutional Affiliation *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.affiliation}
                    onChange={(e) => setNewMember({ ...newMember, affiliation: e.target.value })}
                    placeholder="e.g. University of Oxford"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.country}
                    onChange={(e) => setNewMember({ ...newMember, country: e.target.value })}
                    placeholder="e.g. United Kingdom"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Research Domain &amp; Expertise
                  </label>
                  <input
                    type="text"
                    value={newMember.expertise}
                    onChange={(e) => setNewMember({ ...newMember, expertise: e.target.value })}
                    placeholder="e.g. Epistemic Injustice, Moral Philosophy, Digital Ethics"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Contact Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newMember.email || ''}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="e.g. scholar@ox.ac.uk"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    ORCID Identifier (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMember.orcid || ''}
                    onChange={(e) => setNewMember({ ...newMember, orcid: e.target.value })}
                    placeholder="e.g. 0000-0002-1849-4921"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e] font-mono"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Scholar Biographical Note / Statement (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newMember.bio || ''}
                    onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                    placeholder="Brief overview of scholar appointments, fellowship, and advisory focus..."
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="Member Portrait Photograph"
                    currentValue={newMember.imageUrl}
                    onChange={(val) => setNewMember({ ...newMember, imageUrl: val })}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 bg-stone-100 dark:bg-stone-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1c355e] hover:bg-[#102344] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Advisory Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-850">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#1c355e] dark:text-sky-400" />
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  Edit Advisory Board Member: {editingMember.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Full Name &amp; Academic Titles *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Council Category
                  </label>
                  <select
                    value={editingMember.category || 'international'}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        category: e.target.value as AdvisoryCategory
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  >
                    <option value="international">International Board</option>
                    <option value="scientific">Scientific Council</option>
                    <option value="honorary">Honorary Fellow</option>
                    <option value="policy">Policy &amp; Ethics</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Advisory Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    list="advisory-roles-list-edit"
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                  <datalist id="advisory-roles-list-edit">
                    {commonRoles.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Institutional Affiliation *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.affiliation}
                    onChange={(e) => setEditingMember({ ...editingMember, affiliation: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.country}
                    onChange={(e) => setEditingMember({ ...editingMember, country: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Research Domain &amp; Expertise
                  </label>
                  <input
                    type="text"
                    value={editingMember.expertise}
                    onChange={(e) => setEditingMember({ ...editingMember, expertise: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={editingMember.email || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    ORCID Identifier
                  </label>
                  <input
                    type="text"
                    value={editingMember.orcid || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, orcid: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e] font-mono"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Scholar Biographical Note / Statement
                  </label>
                  <textarea
                    rows={2}
                    value={editingMember.bio || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1c355e]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="Member Portrait Photograph"
                    currentValue={editingMember.imageUrl}
                    onChange={(val) => setEditingMember({ ...editingMember, imageUrl: val })}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 bg-stone-100 dark:bg-stone-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1c355e] hover:bg-[#102344] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
