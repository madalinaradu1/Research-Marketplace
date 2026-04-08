import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API, graphqlOperation } from 'aws-amplify';
import { listMessages } from '../graphql/message-operations';
import styles from './Header.module.css';
import {
  getAccessibilitySettings,
  resetAccessibilitySettings,
  syncAccessibilityRootClasses
} from '../utils/accessibilitySettings';

const Header = ({ user, signOut }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [accessibilityState, setAccessibilityState] = useState(() => getAccessibilitySettings());
  const [searchTerm, setSearchTerm] = useState('');
  const accessibilityCloseTimeoutRef = useRef(null);
  const profileCloseTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-app-header]')) {
        setIsMenuOpen(false);
        setIsAccessibilityOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const fetchUnreadCount = async () => {
    if (!user || !user.id) return;
    try {
      const userId = user.id || user.username;
      if (!userId) return;
      const messageResult = await API.graphql(graphqlOperation(listMessages, { limit: 100 }));
      const allMessages = messageResult.data?.listMessages?.items || [];
      const readMessages = JSON.parse(localStorage.getItem(`read_messages_${userId}`) || '[]');
      const unreadMessages = allMessages.filter((msg) =>
        msg.receiverID === userId && !msg.isRead && !readMessages.includes(msg.id)
      );
      setUnreadCount(unreadMessages.length);
    } catch (error) {
      if (!error.message?.includes('No current user')) {
        console.error('Error fetching unread count:', error);
      }
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/messages') setUnreadCount(0);
  }, [location.pathname]);

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : user?.username || 'User');
  const { fontSizeLevel, dyslexiaFont, highContrast, lineSpacingLevel } = accessibilityState;
  const fontSizeLabels = ['Large Text', '\u2713 Large Text (1/3)', '\u2713 Large Text (2/3)', '\u2713 Large Text (3/3)'];
  const lineSpacingLabels = ['Line Spacing', '\u2713 Line Spacing (1/3)', '\u2713 Line Spacing (2/3)', '\u2713 Line Spacing (3/3)'];

  const syncAccessibilityState = () => {
    setAccessibilityState(syncAccessibilityRootClasses());
  };

  const clearCloseTimeout = (timeoutRef) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const openAccessibilityMenu = () => {
    clearCloseTimeout(accessibilityCloseTimeoutRef);
    setIsAccessibilityOpen(true);
  };

  const scheduleAccessibilityClose = () => {
    clearCloseTimeout(accessibilityCloseTimeoutRef);
    accessibilityCloseTimeoutRef.current = setTimeout(() => {
      setIsAccessibilityOpen(false);
      accessibilityCloseTimeoutRef.current = null;
    }, 30);
  };

  const openProfileMenu = () => {
    clearCloseTimeout(profileCloseTimeoutRef);
    setIsMenuOpen(true);
  };

  const scheduleProfileClose = () => {
    clearCloseTimeout(profileCloseTimeoutRef);
    profileCloseTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
      profileCloseTimeoutRef.current = null;
    }, 30);
  };

  useEffect(() => {
    setAccessibilityState(syncAccessibilityRootClasses());
    document.documentElement.classList.remove('dark-mode');
    localStorage.removeItem('darkMode');
  }, []);

  useEffect(() => () => {
    clearCloseTimeout(accessibilityCloseTimeoutRef);
    clearCloseTimeout(profileCloseTimeoutRef);
  }, []);

  const getNavLinkClassName = (path, extraClass = '') =>
    [styles.navLink, isActive(path) ? styles.navLinkActive : '', extraClass].filter(Boolean).join(' ');

  const getNavTextClassName = (path) => (isActive(path) ? styles.navTextActive : styles.navText);
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedSearch = searchTerm.trim();
    navigate(trimmedSearch ? `/search?q=${encodeURIComponent(trimmedSearch)}` : '/search');
    setSearchTerm('');
  };

  return (
    <header className={styles.header} data-app-header="true">
      <div className={styles.headerInner}>
        <Link to="/dashboard" className={styles.brandLink}>
          <div className={styles.brandRow}>
            <img
              alt="GCU Logo"
              src="/GCU_WHITE.png"
              className={styles.logo}
            />
            <div className={styles.brandTextGroup}>
              <span className={styles.brandTitle}>Undergraduate Research</span>
              <span className={styles.brandTitle}>Opportunity Program</span>
              <span className={styles.brandMeta}>Grand Canyon University</span>
            </div>
          </div>
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {!(user?.role === 'Student' && !user?.profileComplete) && (
            <>
              <Link to="/dashboard" className={getNavLinkClassName('/dashboard')}>
                <span className={getNavTextClassName('/dashboard')}>Dashboard</span>
              </Link>

              {user?.role !== 'Coordinator' && user?.role !== 'Admin' && (
                <Link to="/activity" className={getNavLinkClassName('/activity')}>
                  <span className={getNavTextClassName('/activity')}>My Activity</span>
                </Link>
              )}

              {user?.role !== 'Coordinator' && user?.role !== 'Admin' && (
                <Link to="/messages" className={getNavLinkClassName('/messages', styles.messagesLink)}>
                  <span className={getNavTextClassName('/messages')}>Messages</span>
                  {unreadCount > 0 && (
                    <span className={styles.unreadBadge}>
                      <span className={styles.unreadBadgeText}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </span>
                  )}
                </Link>
              )}

              <Link to="/community" className={getNavLinkClassName('/community')}>
                <span className={getNavTextClassName('/community')}>Community</span>
              </Link>
            </>
          )}

          <form className={styles.searchShell} role="search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search research opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.slice(0, 50))}
              aria-label="Search research opportunities"
            />
            <button
              type="submit"
              data-header-button="true"
              className={styles.searchButton}
              aria-label="Submit search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </form>

          <div
            className={styles.menuAnchor}
            onMouseEnter={openAccessibilityMenu}
            onMouseLeave={scheduleAccessibilityClose}
          >
            <button
              type="button"
              data-header-button="true"
              className={`${styles.iconButton} ${styles.accessibilityTrigger}`}
              aria-label="Accessibility options"
              aria-haspopup="true"
              aria-expanded={isAccessibilityOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="4.5" r="2.5" />
                <path d="M12 7v5" />
                <path d="M8 11h8" />
                <path d="M10 22l2-8 2 8" />
              </svg>
            </button>

            {isAccessibilityOpen && (
              <div
                className={styles.dropdown}
                onMouseEnter={() => clearCloseTimeout(accessibilityCloseTimeoutRef)}
                onMouseLeave={scheduleAccessibilityClose}
              >
                <div className={styles.dropdownHeader}>Accessibility</div>
                <button
                  type="button"
                  data-header-button="true"
                  className={styles.dropdownItem}
                  onClick={() => {
                    const next = (fontSizeLevel + 1) % 4;
                    localStorage.setItem('fontSizeLevel', next.toString());
                    localStorage.removeItem('fontSize');
                    syncAccessibilityState();
                  }}
                >
                  {fontSizeLabels[fontSizeLevel]}
                </button>
                <button
                  type="button"
                  data-header-button="true"
                  className={styles.dropdownItem}
                  onClick={() => {
                    const next = !dyslexiaFont;
                    localStorage.setItem('dyslexiaFont', next ? 'on' : 'off');
                    syncAccessibilityState();
                  }}
                >
                  {dyslexiaFont ? '\u2713 Dyslexia-Friendly Font' : 'Dyslexia-Friendly Font'}
                </button>
                <button
                  type="button"
                  data-header-button="true"
                  className={styles.dropdownItem}
                  onClick={() => {
                    const next = !highContrast;
                    localStorage.setItem('highContrast', next ? 'on' : 'off');
                    syncAccessibilityState();
                  }}
                >
                  {highContrast ? '\u2713 High Contrast' : 'High Contrast'}
                </button>
                <button
                  type="button"
                  data-header-button="true"
                  className={styles.dropdownItem}
                  onClick={() => {
                    const next = (lineSpacingLevel + 1) % 4;
                    localStorage.setItem('lineSpacingLevel', next.toString());
                    syncAccessibilityState();
                  }}
                >
                  {lineSpacingLabels[lineSpacingLevel]}
                </button>
                <button
                  type="button"
                  data-header-button="true"
                  className={styles.dropdownItem}
                  onClick={() => {
                    setAccessibilityState(resetAccessibilitySettings());
                  }}
                >
                  {'\u21BA Reset to Default'}
                </button>
              </div>
            )}
          </div>

          <div
            className={styles.menuAnchor}
            onMouseEnter={() => clearCloseTimeout(profileCloseTimeoutRef)}
            onMouseLeave={scheduleProfileClose}
          >
            <button
              type="button"
              data-header-button="true"
              className={styles.iconButton}
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsAccessibilityOpen(false);
              }}
              onMouseEnter={openProfileMenu}
              aria-label="Profile menu"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="3.25" />
                <path d="M5 19a7 7 0 0 1 14 0" />
              </svg>
            </button>

            {isMenuOpen && (
              <div
                className={`${styles.dropdown} ${styles.profileDropdown}`}
                onMouseEnter={() => clearCloseTimeout(profileCloseTimeoutRef)}
                onMouseLeave={scheduleProfileClose}
              >
                <div className={styles.dropdownHeader}>Profile</div>
                <div className={styles.profileGreeting}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.25" />
                    <path d="M5 19a7 7 0 0 1 14 0" />
                  </svg>
                  <span>{displayName}</span>
                </div>
                {user?.role === 'Student' && (
                  <button
                    type="button"
                    data-header-button="true"
                    className={`${styles.dropdownItem} ${styles.profileAction}`}
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                  >
                    Edit profile
                  </button>
                )}
                <button
                  type="button"
                  data-header-button="true"
                  className={`${styles.dropdownItem} ${styles.profileAction}`}
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className={styles.mobileNav}>
          <div className={styles.mobileMenuAnchor}>
            <button
              type="button"
              data-header-button="true"
              className={styles.mobileMenuButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Navigation Menu"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <span className={styles.mobileMenuBars}>
                <span className={styles.mobileMenuBar} />
                <span className={styles.mobileMenuBar} />
                <span className={styles.mobileMenuBar} />
              </span>
            </button>

            {isMenuOpen && (
              <div className={styles.mobileMenuPanel}>
                <button type="button" data-header-button="true" className={styles.mobileMenuItem} onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}>Dashboard</button>
                <button type="button" data-header-button="true" className={styles.mobileMenuItem} onClick={() => { navigate('/search'); setIsMenuOpen(false); }}>Search</button>
                {user?.role !== 'Coordinator' && user?.role !== 'Admin' && (
                  <button type="button" data-header-button="true" className={styles.mobileMenuItem} onClick={() => { navigate('/activity'); setIsMenuOpen(false); }}>My Activity</button>
                )}
                {user?.role !== 'Coordinator' && user?.role !== 'Admin' && (
                  <button type="button" data-header-button="true" className={styles.mobileMenuItem} onClick={() => { navigate('/messages'); setIsMenuOpen(false); }}>Messages</button>
                )}
                <button type="button" data-header-button="true" className={styles.mobileMenuItem} onClick={() => { navigate('/community'); setIsMenuOpen(false); }}>Community</button>
                {user?.role === 'Student' && (
                  <button type="button" data-header-button="true" className={styles.mobileMenuItem} onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>Profile</button>
                )}
                <button type="button" data-header-button="true" className={styles.mobileMenuItem} onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
