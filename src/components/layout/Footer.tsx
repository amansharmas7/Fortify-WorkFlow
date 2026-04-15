export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-fh-teal rounded-lg flex items-center justify-center text-white font-bold text-xl">F</div>
              <span className="text-xl font-bold text-fh-text-dark tracking-tight">Fortify Docs</span>
            </div>
            <p className="text-fh-text-muted max-w-xs text-sm">
              Standardizing internal tools and processes for Fortify Health through AI-powered documentation.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-fh-text-dark tracking-widest uppercase mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-fh-text-muted hover:text-fh-teal transition-colors">Documentation</a></li>
              <li><a href="#" className="text-fh-text-muted hover:text-fh-teal transition-colors">Internal Tools</a></li>
              <li><a href="#" className="text-fh-text-muted hover:text-fh-teal transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-fh-text-dark tracking-widest uppercase mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-fh-text-muted hover:text-fh-teal transition-colors">About Fortify</a></li>
              <li><a href="#" className="text-fh-text-muted hover:text-fh-teal transition-colors">Careers</a></li>
              <li><a href="#" className="text-fh-text-muted hover:text-fh-teal transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Fortify Health. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-500">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
