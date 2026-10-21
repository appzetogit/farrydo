import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { useSettings } from '../../../../shared/context/SettingsContext';

/**
 * Admin sign-in.
 *
 * A Ferrido-branded split screen: a navy brand panel with the logo pin on large
 * screens, and a plain form beside it. The form itself stays a simple internal
 * login - no security-cosplay copy.
 */

const Field = ({ icon: Icon, id, label, ...props }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-[13px] font-semibold text-[#0B1F3A]">
      {label}
    </label>
    <div className="relative">
      <Icon
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D9730A] pointer-events-none"
      />
      <input
        id={id}
        className="w-full pl-10 pr-3 py-3 bg-[#FAF7F3] border border-[#EEE3D6] rounded-xl text-[14.5px] text-[#0B1F3A] placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#F7941D] focus:ring-4 focus:ring-[#F7941D]/15 transition"
        {...props}
      />
    </div>
  </div>
);

const AdminLogin = () => {
  const { settings } = useSettings();
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const appLogo = settings.general?.logo || settings.customization?.logo || '/ferrido-icon.png';
  // app_name can hold a full tab title ("Ferrido - Ride Easy, ..."); the copy
  // here wants just the name.
  const appName = String(settings.general?.app_name || 'Ferrido').split(' - ')[0];

  const switchView = (next) => {
    setError('');
    setNotice('');
    setView(next);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await adminService.login({ email, password });
      localStorage.setItem('adminToken', response?.token || '');
      localStorage.setItem('adminInfo', JSON.stringify(response?.admin || {}));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // The "forgot password" link used to set a view that was never rendered, so it
  // did nothing. Both adminService.forgotPassword and the backend route exist.
  const handleForgot = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setNotice('');

    try {
      await adminService.forgotPassword(resetEmail);
      setNotice('If that email belongs to an admin account, reset instructions are on their way.');
    } catch (err) {
      // Deliberately generic. The server surfaces raw transport failures here —
      // an unconfigured mail host returns "connect ECONNREFUSED 127.0.0.1:587",
      // which tells a visitor about our infrastructure and nothing useful. The
      // detail still goes to the console for whoever is debugging.
      console.error('[admin] password reset failed:', err.response?.data?.message || err.message);
      setError('Could not send reset instructions right now. Please contact your administrator.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitClass =
    'w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#FFA640] to-[#EE6F12] py-3 text-[14.5px] font-semibold text-white shadow-[0_10px_24px_rgba(247,148,29,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(247,148,29,0.4)] disabled:opacity-60 disabled:hover:translate-y-0';

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex w-[46%] max-w-[640px] flex-col justify-between overflow-hidden bg-[#0B1F3A] p-12 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 100% 100%, rgba(247,148,29,0.35), transparent 70%), radial-gradient(50% 40% at 0% 0%, rgba(43,92,168,0.35), transparent 70%)',
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full border border-dashed border-[#F7941D]/30" />

        <button
          type="button"
          onClick={() => navigate('/')}
          className="relative z-10 flex items-center gap-3 self-start"
          aria-label={`${appName} home`}
        >
          <img src={appLogo} alt="" className="h-11 w-11 rounded-xl bg-white object-cover" />
          <span className="text-[26px] font-extrabold italic tracking-tight">
            Fer<span className="text-[#F7941D]">rido</span>
          </span>
        </button>

        {/* The logo's pin, large, with its speed lines */}
        <div className="relative z-10 mx-auto my-10 flex items-center">
          <div className="mr-4 flex flex-col gap-3">
            <span className="h-[7px] w-24 rounded-full bg-gradient-to-r from-transparent to-[#F7941D]" />
            <span className="h-[7px] w-36 rounded-full bg-gradient-to-r from-transparent to-[#F7941D]" />
            <span className="h-[7px] w-20 rounded-full bg-gradient-to-r from-transparent to-[#F7941D]" />
          </div>
          <div className="flex h-48 w-48 -rotate-45 items-center justify-center rounded-[50%_50%_50%_0] bg-gradient-to-br from-[#F9A12B] to-[#EE6F12] shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
            <div className="flex h-28 w-28 rotate-45 items-center justify-center rounded-full bg-[#0B1F3A]">
              <ShieldCheck size={46} className="text-white" />
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-[34px] font-extrabold leading-tight">
            Ride easy.
            <br />
            <span className="text-[#F7941D]">Run it easier.</span>
          </h2>
          <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-[#A9B6C9]">
            Rides, drivers, fares and payouts - everything that keeps {appName} moving, in one place.
          </p>
          <p className="mt-10 text-[12px] text-white/40">© {new Date().getFullYear()} {appName}</p>
        </div>
      </aside>

      {/* Form */}
      <main className="relative flex flex-1 items-center justify-center px-5 py-12">
        <div
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{ background: 'radial-gradient(70% 40% at 100% 0%, rgba(247,148,29,0.16), transparent 70%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-[400px]"
        >
          {/* Logo for small screens, where the brand panel is hidden */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-3 lg:hidden"
            aria-label={`${appName} home`}
          >
            <img src={appLogo} alt="" className="h-11 w-11 rounded-xl bg-white object-cover shadow-sm" />
            <span className="text-[24px] font-extrabold italic tracking-tight text-[#0B1F3A]">
              Fer<span className="text-[#F7941D]">rido</span>
            </span>
          </button>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#EEE3D6] bg-white px-3 py-1 text-[12px] font-semibold text-[#0B1F3A]">
            <span className="h-2 w-2 rounded-full bg-[#F7941D] shadow-[0_0_0_3px_rgba(247,148,29,0.2)]" />
            Admin panel
          </span>
          <h1 className="mt-4 text-[30px] font-extrabold leading-tight text-[#0B1F3A]">
            {view === 'login' ? 'Welcome back' : 'Reset password'}
          </h1>
          <p className="mt-1.5 text-[14px] text-slate-500">
            {view === 'login'
              ? `Sign in to manage ${appName}.`
              : 'Enter your email and we will send you a reset link.'}
          </p>

          <div className="mt-7 rounded-2xl border border-[#EEE3D6] bg-white p-6 shadow-[0_24px_60px_rgba(11,31,58,0.08)]">
            <AnimatePresence mode="wait">
              {(error || notice) && (
                <motion.div
                  key={error || notice}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mb-5 flex items-start gap-2 rounded-xl border p-3 text-[13px] ${
                    error
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                  role={error ? 'alert' : 'status'}
                >
                  {error ? (
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                  )}
                  <p className="leading-snug">{error || notice}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field
                  icon={Mail}
                  id="admin-email"
                  label="Email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
                <Field
                  icon={Lock}
                  id="admin-password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchView('forgot')}
                    className="text-[13px] font-medium text-[#D9730A] hover:text-[#0B1F3A] transition"
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={isLoading} className={submitClass}>
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                  {isLoading ? 'Signing in…' : 'Sign in'}
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <Field
                  icon={Mail}
                  id="reset-email"
                  label="Email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  autoFocus
                  required
                />

                <button type="submit" disabled={isLoading} className={submitClass}>
                  {isLoading && <Loader2 className="animate-spin" size={16} />}
                  {isLoading ? 'Sending…' : 'Send reset link'}
                </button>

                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="w-full flex items-center justify-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-[#0B1F3A] transition"
                >
                  <ArrowLeft size={14} />
                  Back to sign in
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[12px] text-slate-400">
            <ShieldCheck size={13} /> Authorised access only. Sign-in attempts are logged.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminLogin;
