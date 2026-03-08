import { useNavigation } from './ui/hooks';
import { Header, BottomNav } from './ui/components';
import { InicioPage, NuevoEventoPage, DetalleEventoPage, HistorialPage, MantencionesPage } from './ui/pages';

export default function App() {
  const { currentPage, params, navigateTo, goBack } = useNavigation();

  const renderPage = () => {
    switch (currentPage) {
      case 'inicio':
        return (
          <InicioPage
            onEventClick={(id) => navigateTo('detalle-evento', { eventId: id })}
          />
        );
      case 'nuevo-evento':
        return <NuevoEventoPage onSuccess={() => navigateTo('inicio')} />;
      case 'detalle-evento':
        return (
          <DetalleEventoPage
            eventId={params.eventId ?? ''}
            onBack={goBack}
          />
        );
      case 'historial':
        return (
          <HistorialPage
            onEventClick={(id) => navigateTo('detalle-evento', { eventId: id })}
          />
        );
      case 'mantenciones':
        return <MantencionesPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Header currentPage={currentPage} onBack={goBack} />
      <main className="px-4 py-4">{renderPage()}</main>
      <BottomNav currentPage={currentPage} onNavigate={(page) => navigateTo(page)} />
    </div>
  );
}
