import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore.js';

function AuthCardButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition ${
        active ? 'bg-black text-white' : 'bg-black/5 text-black hover:bg-black/10'
      }`}
    >
      {children}
    </button>
  );
}

export function AuthPage({ defaultMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loading,
    passwordReset,
    login,
    signup,
    continueAsGuest,
    requestPasswordReset,
    verifyPasswordResetOtp,
    resetPassword
  } = useAuthStore();
  const [mode, setMode] = useState(defaultMode);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: ''
  });
  const [signupForm, setSignupForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [resetStep, setResetStep] = useState('request');
  const [resetForm, setResetForm] = useState({
    identifier: '',
    otp: '',
    password: ''
  });

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const activeTitle = useMemo(() => {
    if (mode === 'signup') {
      return 'Create your PriShi account';
    }

    return 'Welcome back to PriShi';
  }, [mode]);

  async function handleGuest() {
    try {
      setError('');
      setInfo('');
      await continueAsGuest();
      navigate('/app');
    } catch (guestError) {
      setError(guestError.message);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setError('');
      setInfo('');
      await login(loginForm);
      navigate('/app');
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();

    try {
      setError('');
      setInfo('');
      await signup({
        name: signupForm.name.trim(),
        username: signupForm.username.trim() || undefined,
        email: signupForm.email.trim() || undefined,
        phone: signupForm.phone.trim() || undefined,
        password: signupForm.password
      });
      setInfo('Account created successfully');
      navigate('/app');
    } catch (signupError) {
      setError(signupError.message);
    }
  }

  async function handleResetRequest(event) {
    event.preventDefault();

    try {
      setError('');
      const result = await requestPasswordReset({
        identifier: resetForm.identifier
      });
      setInfo(result.message || 'OTP sent');
      setResetStep('verify');
    } catch (resetError) {
      setError(resetError.message);
    }
  }

  async function handleResetVerify(event) {
    event.preventDefault();

    try {
      setError('');
      await verifyPasswordResetOtp({
        identifier: resetForm.identifier,
        otp: resetForm.otp
      });
      setInfo('OTP verified. Set a new password.');
      setResetStep('password');
    } catch (verifyError) {
      setError(verifyError.message);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    try {
      setError('');
      await resetPassword({
        resetToken: passwordReset?.resetToken,
        password: resetForm.password
      });
      setInfo('Password updated. You can sign in now.');
      setResetStep('request');
      setMode('login');
      setResetForm({
        identifier: '',
        otp: '',
        password: ''
      });
    } catch (passwordError) {
      setError(passwordError.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 py-10 text-black">
      <div className="w-full max-w-[980px] overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
        <div className="grid min-h-[680px] md:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-black/6 bg-[#fafafa] p-8 md:border-b-0 md:border-r">
            <div className="text-xs uppercase tracking-[0.35em] text-black/45">PriShi</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">{activeTitle}</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-black/55">
              Sign in, create a verified account, or continue as guest. Guest chats stay only in
              the current browser session and disappear on reload.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <AuthCardButton active={mode === 'login'} onClick={() => setMode('login')}>
                Login
              </AuthCardButton>
              <AuthCardButton active={mode === 'signup'} onClick={() => setMode('signup')}>
                Sign Up
              </AuthCardButton>
              <button
                type="button"
                onClick={handleGuest}
                className="rounded-full border border-black/10 px-4 py-2 text-sm transition hover:bg-black/5"
              >
                Continue as Guest
              </button>
            </div>

            <div className="mt-10 rounded-[28px] border border-black/8 bg-white p-6">
              <div className="text-sm font-medium">How this works</div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-black/60">
                <li>Login accepts email, username, or phone.</li>
                <li>Sign up creates your account and signs you in directly.</li>
                <li>Password reset is the only place where OTP verification is required.</li>
                <li>Guest mode skips the database and clears history on reload.</li>
              </ul>
            </div>
          </div>

          <div className="p-8">
            {mode === 'signup' ? (
              <form onSubmit={handleSignup} className="mx-auto max-w-md space-y-4 pt-6">
                <div className="text-2xl font-semibold">Create account</div>
                <input
                  type="text"
                  placeholder="Full name"
                  value={signupForm.name}
                  onChange={(event) =>
                    setSignupForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/35"
                />
                <input
                  type="text"
                  placeholder="Username (optional)"
                  value={signupForm.username}
                  onChange={(event) =>
                    setSignupForm((current) => ({ ...current, username: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/35"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={signupForm.email}
                  onChange={(event) =>
                    setSignupForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/35"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={signupForm.phone}
                  onChange={(event) =>
                    setSignupForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/35"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupForm.password}
                  onChange={(event) =>
                    setSignupForm((current) => ({ ...current, password: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/35"
                />

                {error ? <div className="text-sm text-[#b10000]">{error}</div> : null}
                {info ? <div className="text-sm text-black/55">{info}</div> : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create account'}
                </button>
              </form>
            ) : (
              <div className="mx-auto max-w-md pt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="text-2xl font-semibold">Login</div>
                  <input
                    type="text"
                    placeholder="Email, username, or phone"
                    value={loginForm.identifier}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, identifier: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/35"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, password: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/35"
                  />

                  {error ? <div className="text-sm text-[#b10000]">{error}</div> : null}
                  {info ? <div className="text-sm text-black/55">{info}</div> : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>

                <div className="mt-6 rounded-[28px] border border-black/8 bg-[#fafafa] p-5">
                  <div className="text-sm font-medium">Forgot password</div>

                  {resetStep === 'request' ? (
                    <form onSubmit={handleResetRequest} className="mt-4 space-y-3">
                      <input
                        type="text"
                        placeholder="Email, username, or phone"
                        value={resetForm.identifier}
                        onChange={(event) =>
                          setResetForm((current) => ({ ...current, identifier: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/35"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium disabled:opacity-50"
                      >
                        Send OTP
                      </button>
                    </form>
                  ) : resetStep === 'verify' ? (
                    <form onSubmit={handleResetVerify} className="mt-4 space-y-3">
                      {passwordReset?.devOtp ? (
                        <div className="rounded-2xl bg-black px-4 py-3 text-sm text-white">
                          Development OTP: {passwordReset.devOtp}
                        </div>
                      ) : null}
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter OTP"
                        value={resetForm.otp}
                        onChange={(event) =>
                          setResetForm((current) => ({ ...current, otp: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/35"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium disabled:opacity-50"
                      >
                        Verify OTP
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
                      <input
                        type="password"
                        placeholder="New password"
                        value={resetForm.password}
                        onChange={(event) =>
                          setResetForm((current) => ({ ...current, password: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/35"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium disabled:opacity-50"
                      >
                        Set new password
                      </button>
                    </form>
                  )}
                </div>

                <div className="mt-5 text-xs text-black/35">
                  Current route: {location.pathname}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
