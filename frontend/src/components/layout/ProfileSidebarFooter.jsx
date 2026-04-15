import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore.js';

function getInitials(name) {
  if (!name) {
    return 'G';
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function MenuRow({ label, icon, onClick, active = false, danger = false, hasArrow = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
        active ? 'bg-black/6' : 'hover:bg-black/5'
      } ${danger ? 'text-black/75' : 'text-black'}`}
    >
      <span className="flex items-center gap-3">
        <span className="flex h-5 w-5 items-center justify-center text-[14px] leading-none">
          {icon}
        </span>
        <span>{label}</span>
      </span>
      {hasArrow ? <span className="text-black/35">›</span> : null}
    </button>
  );
}

export function ProfileSidebarFooter() {
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setMenuOpen(false);
        setHelpOpen(false);
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
      name: 'Guest',
      handle: 'Not logged in',
      initials: 'G'
    };
  }, [user]);

  function openPricingPage() {
    const pricingUrl = `${window.location.origin}/pricing`;
    window.open(pricingUrl, '_blank', 'noopener,noreferrer');
    setMenuOpen(false);
    setHelpOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative mt-3">
      {menuOpen ? (
        <div className="absolute bottom-[68px] left-0 z-30 w-[245px] rounded-[20px] border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
          <div className="flex items-center gap-3 rounded-2xl px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4b15c] text-sm font-semibold text-white">
              {profile.initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-black">{profile.name}</div>
              <div className="truncate text-xs text-black/45">{profile.handle}</div>
            </div>
          </div>

          <div className="my-1 border-t border-black/8" />

          <div className="space-y-1">
            <MenuRow label="Upgrade plan" icon="✦" />
            <MenuRow label="Personalization" icon="◔" />
            <MenuRow label="Profile" icon="◉" />
            <MenuRow label="Settings" icon="⚙" />
            <MenuRow
              label="Help"
              icon="?"
              hasArrow
              active={helpOpen}
              onClick={() => setHelpOpen((current) => !current)}
            />
            {user ? (
              <MenuRow
                label="Log out"
                icon="↪"
                danger
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  setHelpOpen(false);
                }}
              />
            ) : (
              <MenuRow label="Log in" icon="↪" />
            )}
          </div>

          {helpOpen ? (
            <div className="absolute bottom-[56px] left-[calc(100%+8px)] w-[170px] rounded-[20px] border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
              <div className="space-y-1">
                <MenuRow label="Help center" icon="?" />
                <MenuRow label="Release notes" icon="✎" />
                <MenuRow label="Terms & policies" icon="▣" />
                <MenuRow label="Report a bug" icon="◷" />
                <MenuRow label="Download apps" icon="↓" />
                <MenuRow label="Keyboard shortcuts" icon="⌘" />
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
          }
        }}
        className="flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-3 text-left shadow-[0_1px_0_rgba(0,0,0,0.03)] ring-1 ring-black/8 transition hover:bg-black/5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4b15c] text-sm font-semibold text-white">
          {profile.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-black">{profile.name}</div>
          <div className="truncate text-xs text-black/45">{profile.handle}</div>
        </div>
        <span className="text-xs text-black/35">{menuOpen ? '▲' : '▼'}</span>
      </button>
    </div>
  );
}
