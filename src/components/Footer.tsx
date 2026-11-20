export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-content flex-col gap-1.5 px-4 py-5 text-xs text-fg-subtle sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>
          © {new Date().getFullYear()} PACE — Personnel &amp; Administrative
          Collaboration Engine. Uploaded data is processed, not stored.
        </p>
        <p>For Official Use Only — handle in accordance with DoDM 5200.01.</p>
      </div>
    </footer>
  );
}
