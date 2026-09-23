export function DashboardFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-1 px-4 py-6 text-xs text-fg-subtle sm:flex-row sm:justify-between sm:px-6">
        <p>
          MerchBase · Product data from{" "}
          <a
            href="https://dummyjson.com"
            target="_blank"
            rel="noreferrer"
            className="rounded underline-offset-2 hover:text-fg hover:underline focus-visible:outline-2 focus-visible:outline-accent"
          >
            DummyJSON
          </a>
        </p>
        <p>Edits are kept in this browser session only.</p>
      </div>
    </footer>
  );
}
