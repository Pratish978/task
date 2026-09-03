// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-stone-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-stone-900 text-white font-black flex items-center justify-center text-xs">
            S
          </div>
          <span className="text-sm font-black text-stone-900">Schedula Clinical Network</span>
        </div>

        <p className="text-xs text-stone-500 font-medium text-center">
          © {new Date().getFullYear()} Schedula Healthcare Systems. All secure rights reserved.
        </p>

        <div className="flex items-center gap-6 text-xs font-bold text-stone-600">
          <span className="hover:text-stone-950 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-stone-950 cursor-pointer">HIPAA Compliance</span>
          <span className="hover:text-stone-950 cursor-pointer">Support</span>
        </div>
      </div>
    </footer>
  );
}