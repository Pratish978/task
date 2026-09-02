export default function Footer() {
  return (
    <footer className="border-t-4 border-black bg-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-black uppercase">
        <p>© 2026 PulseCare Hub. All clinical workflows secured.</p>
        <div className="flex space-x-4">
          <span className="hover:underline cursor-pointer">Privacy Protocol</span>
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span className="hover:underline cursor-pointer">Support Desk</span>
        </div>
      </div>
    </footer>
  );
}