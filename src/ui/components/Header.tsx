import type { Page } from '../hooks/useNavigation';

interface HeaderProps {
  currentPage: Page;
  onBack: () => void;
}

export function Header({ currentPage, onBack }: HeaderProps) {
  return (
    <header className="bg-blue-600 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      {currentPage !== 'inicio' && (
        <button
          onClick={onBack}
          className="text-xl leading-none"
          aria-label="Volver"
        >
          ←
        </button>
      )}
      <h1 className="text-lg font-bold">HomeTracker</h1>
    </header>
  );
}
