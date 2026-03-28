import { Home, CalendarCheck, Settings } from 'lucide-react';

type Tab = 'recepten' | 'weekkeuze' | 'instellingen';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs: { id: Tab; label: string; Icon: typeof Home }[] = [
    { id: 'recepten', label: 'Recepten', Icon: Home },
    { id: 'weekkeuze', label: 'Weekkeuze', Icon: CalendarCheck },
    { id: 'instellingen', label: 'Instellingen', Icon: Settings },
  ];

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
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '8px 4px',
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
