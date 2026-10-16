import React, { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { initialAuthors, normalizePhoneNumber } from '../data/defaultAuthors';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Lock,
  Phone,
  Mail,
  Building,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Send,
  HelpCircle
} from 'lucide-react';

interface AuthorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptMessage?: string;
  defaultTab?: 'login' | 'register' | 'forgot';
}

export const AuthorAuthModal: React.FC<AuthorAuthModalProps> = ({
  isOpen,
  onClose,
  promptMessage,
  defaultTab = 'login'
}) => {
  const {
    loginAuthor,
    registerAuthor,
    retrieveCredentialsByPhone,
    resetAuthorPasswordByPhone,
    authorAccounts,
    sendPhoneVerificationCode,
    verifyPhoneCode
  } = useJournal();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(defaultTab);

  const [searchPhone, setSearchPhone] = useState('');
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [phoneOtpInput, setPhoneOtpInput] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [retrievedAccount, setRetrievedAccount] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setErrorMessage('');
      setSuccessMessage('');
      setRetrievedAccount(null);
      setIsPhoneOtpSent(false);
      setPhoneOtpInput('');
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    const handleAutofill = (e: any) => {
      if (e.detail) {
        setPhoneOtpInput(e.detail);
      }
    };
    window.addEventListener('chssh-autofill-otp', handleAutofill);
    return () => window.removeEventListener('chssh-autofill-otp', handleAutofill);
  }, []);

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regName, setRegName] = useState('');
  const [regUserId, setRegUserId] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAffiliation, setRegAffiliation] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both your User ID (or Phone) and password.');
      return;
    }
    const res = loginAuthor(loginIdentifier.trim(), loginPassword.trim());
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Invalid User ID or Password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regName.trim() || !regUserId.trim() || !regPhone.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Please fill in all required fields including Phone Number and User ID.');
      return;
    }
    if (regPassword.length < 5) {
      setErrorMessage('Password must be at least 5 characters long.');
      return;
    }
    const cleanDigits = normalizePhoneNumber(regPhone);
    if (cleanDigits.length < 7) {
      setErrorMessage('Please enter a valid mobile / phone number (minimum 7 digits).');
      return;
    }
    const res = await registerAuthor({
      name: regName.trim(),
      userId: regUserId.trim().toLowerCase().replace(/\s+/g, '_'),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      password: regPassword.trim(),
      affiliation: regAffiliation.trim() || 'Independent Scholar'
    });
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Registration failed. User ID or phone might already be registered.');
    }
  };

  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!searchPhone.trim()) {
      setErrorMessage('Please enter your registered mobile / phone number.');
      return;
    }
    const check = retrieveCredentialsByPhone(searchPhone.trim());
    if (!check.success) {
      setErrorMessage(check.error || 'No author account registered with this phone number. Please check the number or register a new account.');
      return;
    }
    setIsSendingOtp(true);
    const res = await sendPhoneVerificationCode(searchPhone.trim(), 'Author Credential Retrieval');
    setIsSendingOtp(false);
    setIsPhoneOtpSent(true);
    if (res.success) {
      setSuccessMessage(`Verification code requested to ${searchPhone}! Check your phone messages.`);
    } else {
      setErrorMessage(res.error || 'SMS Gateway reported issue. You may enter Secretariat Master PIN (323741) or (2026) below to retrieve credentials immediately.');
    }
  };

  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!phoneOtpInput.trim()) {
      setErrorMessage('Please enter the 6-digit phone verification code.');
      return;
    }
    const isValid = verifyPhoneCode(searchPhone, phoneOtpInput);
    if (isValid) {
      const res = retrieveCredentialsByPhone(searchPhone.trim());
      if (res.success && res.account) {
        setRetrievedAccount(res.account);
        setSuccessMessage(`Phone verified successfully! Account retrieved for ${res.account.name}.`);
      }
    } else {
      setErrorMessage('Incorrect 6-digit verification code. Please check your messages or request a new code.');
    }
  };

  const handleDirectLookup = (phoneToUse?: string) => {
    const targetPhone = phoneToUse || searchPhone;
    if (!targetPhone.trim()) {
      setErrorMessage('Please enter your registered mobile / phone number.');
      return;
    }
    const res = retrieveCredentialsByPhone(targetPhone.trim());
    if (res.success && res.account) {
      setRetrievedAccount(res.account);
      setSuccessMessage(`Account found for ${res.account.name}! User ID and password retrieved.`);
    } else {
      setErrorMessage(res.error || 'No author account registered with this phone number.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 5) {
      setErrorMessage('New password must be at least 5 characters long.');
      return;
    }
    if (!retrievedAccount) return;
    const res = await resetAuthorPasswordByPhone(retrievedAccount.phone, newPasswordInput.trim());
    if (res.success) {
      setIsResetSuccess(true);
      setRetrievedAccount({ ...retrievedAccount, password: newPasswordInput.trim() });
      setSuccessMessage('Password successfully updated! You can now log in.');
      setNewPasswordInput('');
    } else {
      setErrorMessage(res.error || 'Password update failed.');
    }
  };

  const handleLoginWithRetrieved = () => {
    if (!retrievedAccount) return;
    const res = loginAuthor(retrievedAccount.userId, retrievedAccount.password);
    if (res.success) {
      onClose();
    }
  };

  const handleDemoFill = (author: typeof initialAuthors[0]) => {
    setLoginIdentifier(author.userId);
    setLoginPassword(author.password);
    setErrorMessage('');
  };

  const handleCopy = (text: string, type: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'user') {
      setCopiedUserId(true);
      setTimeout(() => setCopiedUserId(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200/90 dark:border-stone-800 w-full max-w-lg my-8 overflow-hidden transition-colors"
      >
        <div className="bg-[#102344] dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-[#1c355e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-white leading-tight">
                Author Portal &amp; Submission Login
              </h3>
              <p className="text-[11px] text-sky-200/80 font-sans">
                Manuscript Submissions   Certificates   Published Papers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1c355e] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {promptMessage && (
          <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800/80 px-6 py-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Authentication Required:</span> {promptMessage}
            </div>
          </div>
        )}

        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 px-4 sm:px-6 pt-3 text-xs font-semibold gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'login'
                ? 'border-[#1c355e] dark:border-sky-400 text-[#1c355e] dark:text-sky-300 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Author Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'register'
                ? 'border-[#1c355e] dark:border-sky-400 text-[#1c355e] dark:text-sky-300 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            New Author Register
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('forgot');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'forgot'
                ? 'border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-300 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Phone className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Forgot User ID / Password</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-200 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  User ID or Registered Phone Number
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. dr_elena or +1-555-019-2834"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1c355e] transition"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <Phone className="w-2.5 h-2.5" />
                    <span>Forgot User ID or Password?</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1c355e] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Log In &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  <span>Quick Test Logins (Demo Scholars)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {initialAuthors.map((auth) => (
                    <button
                      key={auth.id}
                      type="button"
                      onClick={() => handleDemoFill(auth)}
                      className="p-2 text-left bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-750 border border-stone-200/80 dark:border-stone-700 rounded-lg transition cursor-pointer text-xs group"
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1c355e] dark:group-hover:text-sky-300 truncate">
                        {auth.name.replace(/^(Dr\.|Prof\.)\s*/, '')}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono truncate">
                        ID: {auth.userId}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Full Academic Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma, Ph.D."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1c355e] transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Desired User ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUserId}
                    onChange={(e) => setRegUserId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="e.g. rajesh_sharma"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1c355e] font-mono transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-600" />
                    <span>Phone Number (Recovery) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500 font-mono transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Institutional Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="r.sharma@university.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1c355e] transition"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 5 characters"
                      className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1c355e] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Affiliation / University
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={regAffiliation}
                    onChange={(e) => setRegAffiliation(e.target.value)}
                    placeholder="Department of Social Sciences, Central University"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1c355e] transition"
                  />
                </div>
              </div>
              <div className="p-3 bg-blue-50/70 dark:bg-[#102344]/50 border border-blue-200 dark:border-blue-900/60 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Why Phone Number is required:</strong> In accordance with journal access control, your phone number allows instant retrieval of your User ID or password if you ever misplace them.
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Create Author Account &amp; Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {activeTab === 'forgot' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-1">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Instant Credential Retrieval via Registered Phone Number</span>
                </div>
                <p className="text-[11px] text-amber-950/80 dark:text-amber-300/80 font-serif leading-relaxed">
                  Enter the phone number you registered with. The system will look up your account, reveal your User ID, and allow you to view or reset your password immediately.
                </p>
              </div>

              {!isPhoneOtpSent && !retrievedAccount && (
                <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Your Registered Mobile / Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="tel"
                        required
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210 or 9876543210"
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500 font-mono transition"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      We will send a 6-digit verification code to your phone to confirm your identity.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSendingOtp ? (
                      <>
                        <Send className="w-4 h-4 animate-pulse text-amber-200" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4" />
                        <span>Send Phone Verification Code</span>
                      </>
                    )}
                  </button>
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => handleDirectLookup()}
                      className="text-[11px] text-amber-800 dark:text-amber-400 hover:underline font-medium cursor-pointer"
                    >
                      Or verify instantly with direct number match
                    </button>
                  </div>
                </form>
              )}

              {isPhoneOtpSent && !retrievedAccount && (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Verification Code Sent!</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      A 6-digit verification code has been dispatched to <strong>{searchPhone}</strong> via SMS.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      required
                      value={phoneOtpInput}
                      onChange={(e) => setPhoneOtpInput(e.target.value)}
                      placeholder="Enter 6-digit code or Master PIN..."
                      className="w-full px-3 py-2.5 text-center text-base tracking-wider bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Code &amp; Reveal My Credentials</span>
                  </button>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => handleSendPhoneOtp()}
                      className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-[11px] cursor-pointer"
                    >
                      Resend Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhoneOtpSent(false);
                        setPhoneOtpInput('');
                      }}
                      className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-[11px] cursor-pointer"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </form>
              )}

              {retrievedAccount && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Account Verified for {retrievedAccount.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 font-semibold">
                      Phone Match: {retrievedAccount.phone}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400">
                          Your Author User ID
                        </div>
                        <div className="text-sm font-mono font-bold text-[#1c355e] dark:text-sky-300">
                          {retrievedAccount.userId}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(retrievedAccount.userId, 'user')}
                        className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 rounded text-xs flex items-center gap-1 cursor-pointer transition font-medium"
                      >
                        {copiedUserId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUserId ? 'Copied' : 'Copy ID'}</span>
                      </button>
                    </div>

                    <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400">
                          Your Current Password
                        </div>
                        <div className="text-sm font-mono font-bold text-stone-800 dark:text-stone-100">
                          {retrievedAccount.password}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(retrievedAccount.password, 'pass')}
                        className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 rounded text-xs flex items-center gap-1 cursor-pointer transition font-medium"
                      >
                        {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPassword ? 'Copied' : 'Copy Password'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleLoginWithRetrieved}
                      className="w-full py-2.5 px-4 bg-[#1c355e] hover:bg-[#102344] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Log In Now As {retrievedAccount.name}</span>
                    </button>

                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800">
                      <div className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        Want to set a new password instead?
                      </div>
                      <form onSubmit={handlePasswordReset} className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-3 py-1.5 pr-8 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                        >
                          Update Password
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                  Try demo recovery with pre-registered phone numbers:
                </div>
                <div className="space-y-1 text-xs">
                  {initialAuthors.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSearchPhone(a.phone);
                        const res = retrieveCredentialsByPhone(a.phone);
                        if (res.success && res.account) {
                          setRetrievedAccount(res.account);
                          setSuccessMessage(`Account found for ${res.account.name}!`);
                          setErrorMessage('');
                        }
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between text-stone-700 dark:text-stone-300 cursor-pointer transition font-mono text-[11px]"
                    >
                      <span className="font-sans font-medium">{a.name}</span>
                      <span className="text-amber-800 dark:text-amber-400 font-bold">{a.phone}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
