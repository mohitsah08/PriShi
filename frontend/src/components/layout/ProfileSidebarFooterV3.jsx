import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';

function getInitials(name) {
  if (!name) {
    return 'G';
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function MenuRow({ label, icon, onClick, active = false, hasArrow = false, theme = 'light' }) {
  const activeClass = active
    ? theme === 'dark'
      ? 'bg-white/8 text-white'
      : 'bg-black/6 text-black'
    : theme === 'dark'
      ? 'text-white hover:bg-white/6'
      : 'text-black hover:bg-black/5';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${activeClass}`}
    >
      <span className="flex items-center gap-3">
        <span className="flex h-5 w-5 items-center justify-center text-[14px] leading-none">
          {icon}
        </span>
        <span>{label}</span>
      </span>
      {hasArrow ? <span className={theme === 'dark' ? 'text-white/45' : 'text-black/35'}>{'>'}</span> : null}
    </button>
  );
}

export function ProfileSidebarFooterV3() {
  const wrapperRef = useRef(null);
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setMenuOpen(false);
        setHelpOpen(false);
        setSettingsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profile = useMemo(() => {
    if (user) {
      return {
        name: user.name || 'User',
        handle: user.email || '',
        initials: getInitials(user.name)
      };
    }

    return {
      name: 'PriShi',
      handle: 'Direct access',
      initials: 'P'
    };
  }, [user]);

  const menuClasses =
    theme === 'dark'
      ? 'border-white/10 bg-[#171717] text-white'
      : 'border-black/10 bg-white text-black';
  const buttonClasses =
    theme === 'dark'
      ? 'bg-[#1a1a1a] text-white ring-1 ring-white/10 hover:bg-white/6'
      : 'bg-white text-black ring-1 ring-black/8 hover:bg-black/5';

  function closeMenus() {
    setMenuOpen(false);
    setHelpOpen(false);
    setSettingsOpen(false);
  }

  function openPricingPage() {
    const pricingUrl = `${window.location.origin}/pricing`;
    window.open(pricingUrl, '_blank', 'noopener,noreferrer');
    closeMenus();
  }

  return (
    <div ref={wrapperRef} className="relative mt-3">
      {menuOpen ? (
        <div
          className={`absolute bottom-[68px] left-0 z-30 w-[250px] rounded-[22px] border p-2 shadow-[0_18px_50px_rgba(0,0,0,0.18)] ${menuClasses}`}
        >
          <div className="flex items-center gap-3 rounded-2xl px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4b15c] text-sm font-semibold text-white">
              {profile.initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{profile.name}</div>
              <div className={theme === 'dark' ? 'truncate text-xs text-white/45' : 'truncate text-xs text-black/45'}>
                {profile.handle}
              </div>
            </div>
          </div>

          <div className={theme === 'dark' ? 'my-1 border-t border-white/8' : 'my-1 border-t border-black/8'} />

          <div className="space-y-1">
            <MenuRow label="See plans and pricing" icon="*" onClick={openPricingPage} theme={theme} />
            <MenuRow label="Personalization" icon="o" theme={theme} />
            <MenuRow label="Profile" icon="@" theme={theme} />
            <MenuRow
              label="Settings"
              icon="S"
              hasArrow
              active={settingsOpen}
              onClick={() => {
                setSettingsOpen((current) => !current);
                setHelpOpen(false);
              }}
              theme={theme}
            />
            <MenuRow
              label="Help"
              icon="?"
              hasArrow
              active={helpOpen}
              onClick={() => {
                setHelpOpen((current) => !current);
                setSettingsOpen(false);
              }}
              theme={theme}
            />
            {user ? (
              <MenuRow
                label="Log out"
                icon="<"
                onClick={() => {
                  logout();
                  closeMenus();
                }}
                theme={theme}
              />
            ) : null}
          </div>

          {settingsOpen ? (
            <div
              className={`absolute bottom-[94px] left-[calc(100%+8px)] w-[190px] rounded-[20px] border p-2 shadow-[0_18px_50px_rgba(0,0,0,0.18)] ${menuClasses}`}
            >
              <div className={theme === 'dark' ? 'px-3 pb-2 pt-1 text-xs uppercase tracking-[0.18em] text-white/45' : 'px-3 pb-2 pt-1 text-xs uppercase tracking-[0.18em] text-black/35'}>
                Theme
              </div>
              <div className="space-y-1">
                <MenuRow
                  label="Dark theme"
                  icon="D"
                  active={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                  theme={theme}
                />
                <MenuRow
                  label="Light theme"
                  icon="L"
                  active={theme === 'light'}
                  onClick={() => setTheme('light')}
                  theme={theme}
                />
              </div>
            </div>
          ) : null}

          {helpOpen ? (
            <div
              className={`absolute bottom-[56px] left-[calc(100%+8px)] w-[188px] rounded-[20px] border p-2 shadow-[0_18px_50px_rgba(0,0,0,0.18)] ${menuClasses}`}
            >
              <div className="space-y-1">
                <MenuRow label="Help center" icon="?" theme={theme} />
                <MenuRow label="Release notes" icon="R" theme={theme} />
                <MenuRow label="Terms & policies" icon="T" theme={theme} />
                <MenuRow label="Report a bug" icon="!" theme={theme} />
                <MenuRow label="Download apps" icon="v" theme={theme} />
                <MenuRow label="Keyboard shortcuts" icon="K" theme={theme} />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setMenuOpen((current) => !current);
          if (menuOpen) {
            setHelpOpen(false);
            setSettingsOpen(false);
          }
        }}
        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left shadow-[0_1px_0_rgba(0,0,0,0.03)] transition ${buttonClasses}`}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4b15c] text-sm font-semibold text-white">
          {profile.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{profile.name}</div>
          <div className={theme === 'dark' ? 'truncate text-xs text-white/45' : 'truncate text-xs text-black/45'}>
            {profile.handle}
          </div>
        </div>
        <span className={theme === 'dark' ? 'text-xs text-white/35' : 'text-xs text-black/35'}>
          {menuOpen ? '^' : 'v'}
        </span>
      </button>
    </div>
  );
}
