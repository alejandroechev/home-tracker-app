import type { Page } from '../hooks/useNavigation';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const tabs: { page: Page; label: string; icon: string }[] = [
  { page: 'inicio', label: 'Inicio', icon: '🏠' },
  { page: 'nuevo-evento', label: 'Nuevo', icon: '📝' },
  { page: 'mantenciones', label: 'Mantenciones', icon: '🔧' },
  { page: 'historial', label: 'Historial', icon: '📋' },
];

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
      {tabs.map((tab) => {
        const isActive = currentPage === tab.page;
        return (
          <button
            key={tab.page}
            onClick={() => onNavigate(tab.page)}
            className={`flex-1 flex flex-col items-center py-2 text-xs ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`}
            aria-label={tab.label}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
