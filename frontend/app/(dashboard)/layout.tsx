"use client";

import styles from "./layout.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  UserSearch,
  FileText,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Layers,
  Inbox,
  ShieldAlert,
  Activity,
  History,
  BookOpen,
  Building2,
  User,
  Globe,
  ExternalLink
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import { NotificationModal } from "../components/NotificationModal";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../components/LoadingSpinner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ username?: string; full_name?: string; role?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("amltab_user");
    const token = localStorage.getItem("amltab_token");

    if (userData && token) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data:", e);
        // Invalid user data, redirect to login
        router.push("/signin");
      }
    } else {
      // No token, redirect to login
      router.push("/signin");
    }
    setIsLoading(false);
  }, [router]);

  // Close profile menu on click outside
  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClick = () => setProfileMenuOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [profileMenuOpen]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("amltab_token");
      if (!token) return;

      try {
        const res = await fetch(`/api/v1/notifications/count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unread_count);
        }
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("amltab_token");
    localStorage.removeItem("amltab_refresh_token");
    localStorage.removeItem("amltab_user");
    router.push("/signin");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/screen", label: "Screening", icon: UserSearch },
    { href: "/global-search", label: "Global Entity Search", icon: Globe },
    { href: "/bulk", label: "Bulk Screening", icon: Layers },
    { href: "/cases", label: "Compliance & Case Management", icon: Inbox },
    { href: "/monitoring", label: "Monitoring", icon: Bell },
    { href: "/activity", label: "Activity Center", icon: Activity },
    { href: "/history/all", label: "History & Audit", icon: History },
    { href: "/api-docs", label: "API Documentation", icon: BookOpen },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  // Get initials for avatar
  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchScreenings = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const token = localStorage.getItem("amltab_token");
      const API_URL = "/api/v1";

      try {
        const res = await fetch(`${API_URL}/screen?query=${encodeURIComponent(searchQuery)}&limit=5`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchScreenings, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--background)'
      }}>
        <div className="pulsate">
          <Image
            src="/logo_transparent.png"
            alt="AMLTAB Logo"
            width={80}
            height={80}
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoArea}>
          <div className={styles.logoWrapper}>
            <Image src="/logo_transparent.png" alt="AMLTAB Logo" width={32} height={32} />
          </div>
          <span className={styles.logoText}>AMLTAB</span>
          {sidebarOpen && (
            <button
              className={styles.mobileMenuBtn}
              style={{ marginLeft: 'auto', color: 'white' }}
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className={styles.nav}>
          {navItems.map((item: any) => {
            const Icon = item.icon;
            // Check if current path matches the nav item
            const isActive = item.href
              ? (pathname === item.href ||
                (item.href === '/dashboard' && pathname === '/') ||
                (item.href === '/history/all' && pathname.startsWith('/history')) ||
                (item.href === '/monitoring' && pathname === '/monitoring'))
              : false;

            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.href === '/api-docs' || item.external ? "_blank" : undefined}
                rel={item.href === '/api-docs' || item.external ? "noopener noreferrer" : undefined}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                {item.label}
                {(item.href === '/api-docs' || item.external) && <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout button at bottom */}
        <div className={styles.logoutArea}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className={styles.searchContainer} style={{ position: 'relative' }}>
              <div className={styles.searchBar}>
                <Search className={styles.searchIcon} size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search entities, screenings, cases..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {!searchQuery && (
                  <div className={styles.searchShortcut}>
                    <span>⌘</span><span>K</span>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchQuery && (searchResults.length > 0 || isSearching) && (
                <div className={styles.searchResultsDropdown}>
                  {isSearching ? (
                    <div className={styles.searchLoader}>
                      <LoadingSpinner size="small" />
                    </div>
                  ) : (
                    searchResults.map((result: any) => (
                      <Link
                        key={result.id}
                        href={`/screenings/${result.id}`}
                        className={styles.searchResultItem}
                        onClick={() => setSearchQuery("")}
                      >
                        <div className={styles.resultIcon}>
                          {result.company_name ? <Building2 size={14} /> : <User size={14} />}
                        </div>
                        <div className={styles.resultInfo}>
                          <span className={styles.resultName}>
                            {result.company_name || `${result.first_name || ""} ${result.last_name || ""}`}
                          </span>
                          <span className={styles.resultMeta}>
                            {result.id.slice(0, 8)} • {result.status}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.headerRight}>
            <ThemeToggle />
            <button
              className={styles.iconBtn}
              onClick={() => setNotificationModalOpen(true)}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>

            <div className={styles.profileWrapper}>
              <div
                className={styles.profileInfo}
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileMenuOpen(!profileMenuOpen);
                }}
              >
                <div className={styles.avatar}>{getInitials()}</div>
                <div className={styles.profileText}>
                  <span className={styles.profileName}>{user?.full_name || user?.username || 'User'}</span>
                  <span className={styles.profileRole}>{user?.role || 'Staff Member'}</span>
                </div>
                <ChevronDown size={14} className={`${styles.profileChevron} ${profileMenuOpen ? styles.chevronRotated : ''}`} />
              </div>

              {profileMenuOpen && (
                <div className={styles.profileDropdown} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownEmail}>{user?.username || 'user@example.com'}</span>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link href="/settings" className={styles.dropdownItem} onClick={() => setProfileMenuOpen(false)}>
                    <Settings size={16} />
                    Go to your profile setting
                  </Link>
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notification Modal */}
          <NotificationModal
            isOpen={notificationModalOpen}
            onClose={() => setNotificationModalOpen(false)}
            initialUnreadCount={unreadCount}
            onUnreadCountChange={setUnreadCount}
          />
        </header>

        {/* Page Content */}
        <div className={styles.contentWrapper}>
          <div className={styles.pageTransition}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
