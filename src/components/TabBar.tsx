import { Home, CalendarCheck, Settings } from 'lucide-react';
import { SidebarDecoratie } from './illustrations/Decorations';

type Tab = 'recepten' | 'weekkeuze' | 'instellingen';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  vertical?: boolean;
}

export default function TabBar({ activeTab, onTabChange, vertical = false }: TabBarProps) {
  const tabs: { id: Tab; label: string; Icon: typeof Home }[] = [
    { id: 'recepten', label: 'Recepten', Icon: Home },
    { id: 'weekkeuze', label: 'Weekkeuze', Icon: CalendarCheck },
    { id: 'instellingen', label: 'Instellingen', Icon: Settings },
  ];

  if (vertical) {
    return (
      <nav style={{
        width: 230,
        background: 'var(--cobalt)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 16px 24px',
        gap: 4,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: 'var(--font-title)',
          fontSize: 26,
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: 32,
          paddingLeft: 12,
          lineHeight: 1.1,
          letterSpacing: '-0.3px',
        }}>
          Smakelijk
        </div>

        {tabs.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10,
                color: active ? 'var(--cobalt)' : 'rgba(255,255,255,0.75)',
                background: active ? '#FFFFFF' : 'transparent',
                fontSize: 14, fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.8}
                color={active ? 'var(--cobalt)' : 'rgba(255,255,255,0.75)'}
              />
              {label}
            </button>
          );
        })}

        {/* Bottom decoration */}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, opacity: 0.7 }}>
          <SidebarDecoratie width={64} />
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="tab-bar"
      style={{
        display: 'flex',
        background: 'var(--card)',
        borderTop: '1px solid var(--border-light)',
        boxShadow: '0 -2px 16px rgba(26,26,46,0.07)',
        minHeight: 'var(--tab-height)',
        flexShrink: 0,
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '8px 4px',
              color: active ? 'var(--cobalt)' : 'var(--text-muted)',
              transition: 'color 0.15s',
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 400 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
