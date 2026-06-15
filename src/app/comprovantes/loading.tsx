export default function ReceiptsLoading() {
  return (
    <main className="app-shell receipts-shell">
      <section className="dashboard-loading" aria-live="polite">
        <p>Carregando comprovantes...</p>
        <span>Estamos buscando somente os arquivos da sua conta.</span>
      </section>
    </main>
  );
}
