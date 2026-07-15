export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[#E5E9F0] bg-white py-6 text-center text-xs text-[#9AA3B2]">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p>© {currentYear} Acentura. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-[#16233F]">Privacy Policy</a>
          <a href="#" className="transition-colors hover:text-[#16233F]">Terms of Service</a>
          <a href="#" className="transition-colors hover:text-[#16233F]">Support</a>
        </div>
      </div>
    </footer>
  );
}
