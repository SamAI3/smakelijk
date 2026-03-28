import { Home, CalendarCheck, Settings } from 'lucide-react';

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
        width: 220,
        background: 'var(--card)',
        borderRight: '1px solid rgba(45,42,38,0.08)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        gap: 4,
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: 'var(--font-title)',
          fontSize: 22,
          color: 'var(--text)',
          marginBottom: 24,
          paddingLeft: 12,
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
                padding: '10px 12px', borderRadius: 10,
                color: active ? 'var(--accent1)' : '#7A7570',
                background: active ? 'rgba(196,101,58,0.08)' : 'transparent',
                fontSize: 14, fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      className="tab-bar"
      style={{
        display: 'flex',
        background: 'var(--card)',
        borderTop: '1px solid rgba(45,42,38,0.08)',
        boxShadow: '0 -2px 12px rgba(45,42,38,0.06)',
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
              color: active ? 'var(--accent1)' : '#A09A93',
              transition: 'color 0.15s',
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
