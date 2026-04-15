import { Link } from "react-router-dom";
import { FileText, PlusCircle, LayoutDashboard, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-fh-teal rounded-lg flex items-center justify-center text-white font-bold text-xl">F</div>
              <span className="text-xl font-bold text-fh-text-dark tracking-tight">Fortify Docs</span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-fh-text-dark border-b-2 border-transparent hover:border-fh-teal transition-colors">
                Dashboard
              </Link>
              <Link to="/processes" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-fh-text-muted hover:text-fh-text-dark border-b-2 border-transparent hover:border-fh-teal transition-colors">
                Processes
              </Link>
              <Link to="/generate" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-fh-text-muted hover:text-fh-text-dark border-b-2 border-transparent hover:border-fh-teal transition-colors">
                Generate
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/generate">
              <Button variant="outline" size="sm" className="gap-2 border-fh-border text-fh-text-dark hover:text-fh-teal">
                <PlusCircle className="w-4 h-4" />
                New Process
              </Button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-fh-bg flex items-center justify-center text-fh-teal font-semibold text-xs border border-fh-border">
              AH
            </div>
          </div>
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 py-2 px-4 space-y-1">
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Dashboard</Link>
          <Link to="/processes" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Processes</Link>
          <Link to="/generate" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Generate</Link>
        </div>
      )}
    </nav>
  );
}
