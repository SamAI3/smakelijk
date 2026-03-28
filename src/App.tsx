import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HouseholdProvider, useHousehold } from './context/HouseholdContext';
import { ReceptenProvider } from './context/ReceptenContext';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ReceptenTab from './screens/ReceptenTab';
import WeekkeuzeTab from './screens/WeekkeuzeTab';
import InstellingenTab from './screens/InstellingenTab';
import ReceptDetailScreen from './screens/ReceptDetailScreen';
import ReceptFormScreen from './screens/ReceptFormScreen';
import TabBar from './components/TabBar';
import { Recept } from './types';

type Tab = 'recepten' | 'weekkeuze' | 'instellingen';
type Screen =
  | { type: 'tabs' }
  | { type: 'detail'; recept: Recept }
  | { type: 'form'; recept?: Recept };

function AppInner() {
  const { user, loading: authLoading } = useAuth();
  const { household, loading: householdLoading } = useHousehold();
  const [activeTab, setActiveTab] = useState<Tab>('recepten');
  const [screen, setScreen] = useState<Screen>({ type: 'tabs' });

  if (authLoading || householdLoading) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'var(--accent1)', opacity: 0.6,
          animation: 'pulse 1.2s ease-in-out infinite',
        }} />
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.15); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  if (!household) return <OnboardingScreen />;

  // Detail scherm
  if (screen.type === 'detail') {
    return (
      <ReceptDetailScreen
        recept={screen.recept}
        onBack={() => setScreen({ type: 'tabs' })}
        onEdit={(r) => setScreen({ type: 'form', recept: r })}
      />
    );
  }

  // Formulier scherm
  if (screen.type === 'form') {
    return (
      <ReceptFormScreen
        recept={screen.recept}
        onBack={() => {
          if (screen.recept) {
            setScreen({ type: 'detail', recept: screen.recept });
          } else {
            setScreen({ type: 'tabs' });
          }
        }}
        onSaved={(receptId) => {
          // Na opslaan: ga naar detail of terug naar lijst
          setScreen({ type: 'tabs' });
        }}
      />
    );
  }

  // Hoofd tabs
  return (
    <>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'recepten' && (
          <ReceptenTab
            onOpenRecept={(r) => setScreen({ type: 'detail', recept: r })}
            onAddRecept={() => setScreen({ type: 'form' })}
          />
        )}
        {activeTab === 'weekkeuze' && <WeekkeuzeTab />}
        {activeTab === 'instellingen' && <InstellingenTab />}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HouseholdProvider>
        <ReceptenProvider>
          <AppInner />
        </ReceptenProvider>
      </HouseholdProvider>
    </AuthProvider>
  );
}
