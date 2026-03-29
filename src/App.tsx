import { useState } from 'react';
import { IconContext } from '@phosphor-icons/react';
import { useWindowWidth, TABLET } from './hooks/useWindowWidth';
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
  | { type: 'detail'; recept: Recept; kookModus?: boolean }
  | { type: 'form'; recept?: Recept };

function AppInner() {
  const { user, loading: authLoading } = useAuth();
  const { household, loading: householdLoading } = useHousehold();
  const [activeTab, setActiveTab] = useState<Tab>('recepten');
  const [screen, setScreen] = useState<Screen>({ type: 'tabs' });
  const breedte = useWindowWidth();
  const isTablet = breedte >= TABLET;

  if (authLoading || householdLoading) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'var(--cobalt)', opacity: 0.6,
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

  if (screen.type === 'detail') {
    return (
      <ReceptDetailScreen
        recept={screen.recept}
        kookModusInitieel={screen.kookModus}
        onBack={() => setScreen({ type: 'tabs' })}
        onEdit={(r) => setScreen({ type: 'form', recept: r })}
      />
    );
  }

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
        onSaved={() => setScreen({ type: 'tabs' })}
      />
    );
  }

  return (
    <>
      <div style={{
        flex: 1, overflow: 'hidden', display: 'flex',
        flexDirection: isTablet ? 'row' : 'column',
      }}>
        {isTablet && (
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} vertical />
        )}
        <div style={{
          flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {activeTab === 'recepten' && (
            <ReceptenTab
              onOpenRecept={(r) => setScreen({ type: 'detail', recept: r })}
              onAddRecept={() => setScreen({ type: 'form' })}
            />
          )}
          {activeTab === 'weekkeuze' && (
            <WeekkeuzeTab
              onGaNaarRecepten={() => setActiveTab('recepten')}
              onStartKoken={(r) => setScreen({ type: 'detail', recept: r, kookModus: true })}
            />
          )}
          {activeTab === 'instellingen' && <InstellingenTab />}
        </div>
      </div>
      {!isTablet && (
        <>
          {/* Spacer — reserveert ruimte voor de fixed tab bar, zelfde kleur om stripe te voorkomen */}
          <div style={{ height: 'calc(var(--tab-height) + env(safe-area-inset-bottom, 0px))', flexShrink: 0, background: '#FFFDF7' }} aria-hidden />
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <IconContext.Provider value={{ weight: 'duotone', size: 24, color: 'currentColor' }}>
      <AuthProvider>
        <HouseholdProvider>
          <ReceptenProvider>
            <AppInner />
          </ReceptenProvider>
        </HouseholdProvider>
      </AuthProvider>
    </IconContext.Provider>
  );
}
