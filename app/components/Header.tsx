export default function Header() {
  return (
    <header className="px-8 py-8 lg:px-12 flex items-center justify-between">
      <a className="block" href="/">
        <img
          src="/kwidao-logo-dark-mode.svg"
          alt="Kwidao Logo"
          className="h-8 w-auto"
        />
      </a>
      <div className="flex items-center gap-4">
        <button
          disabled
          className="px-5 py-2 text-sm bg-foreground/50 text-background rounded-full font-medium cursor-not-allowed"
        >
          Testnet
        </button>
        <span className="text-xs">Soon</span>
      </div>
    </header>
  );
}
