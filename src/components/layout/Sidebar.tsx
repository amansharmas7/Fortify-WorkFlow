import { LayoutDashboard, FileText, GitBranch, Library, Users, Settings, Sparkles, LogIn, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "@/src/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Signed in successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign out.");
    }
  };

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/" },
    { icon: <FileText size={18} />, label: "Process Templates", path: "/processes" },
    { icon: <GitBranch size={18} />, label: "Active Workflows", path: "/workflows" },
    { icon: <Users size={18} />, label: "Team & Roles", path: "/team" },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="bg-card border-r border-fh-border flex flex-col p-4 shrink-0 h-screen sticky top-0 z-50"
    >
      <div className="flex items-center justify-between mb-10 px-2">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-fh-teal rounded-md flex items-center justify-center text-white shrink-0">
              <Sparkles size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight text-fh-teal whitespace-nowrap">FORTIFY WORKFLOW</span>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-fh-teal rounded-md flex items-center justify-center text-white mx-auto">
            <Sparkles size={18} />
          </div>
        )}
      </div>

      <div className="absolute -right-3 top-20">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-6 w-6 rounded-full border-fh-border bg-card shadow-sm hover:bg-accent"
          onClick={onToggle}
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
              location.pathname === item.path
                ? "bg-accent text-fh-teal"
                : "text-fh-text-muted hover:bg-accent/50 hover:text-fh-text-dark"
            )}
          >
            <span className={cn(
              "shrink-0",
              location.pathname === item.path ? "text-fh-teal" : "opacity-60"
            )}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-fh-text-dark text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </Link>
        ))}
        
        <div className="pt-8 pb-2 px-3">
          {!isCollapsed ? (
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System</span>
          ) : (
            <div className="h-px bg-fh-border w-full" />
          )}
        </div>
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
            location.pathname === "/settings"
              ? "bg-accent text-fh-teal"
              : "text-fh-text-muted hover:bg-accent/50 hover:text-fh-text-dark"
          )}
        >
          <span className={cn(
            "shrink-0",
            location.pathname === "/settings" ? "text-fh-teal" : "opacity-60"
          )}>
            <Settings size={18} />
          </span>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="whitespace-nowrap"
            >
              Settings
            </motion.span>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-fh-text-dark text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Settings
            </div>
          )}
        </Link>
      </nav>

      <div className="mt-auto pt-5 border-t border-fh-border">
        {isLoading ? (
          <div className="flex items-center gap-3 animate-pulse px-2">
            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
            {!isCollapsed && <div className="h-4 w-24 bg-muted/50 rounded" />}
          </div>
        ) : user ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ""} className="w-8 h-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                </div>
              )}
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-hidden"
                >
                  <div className="text-sm font-semibold truncate">{user.displayName || "User"}</div>
                  <div className="text-[11px] text-fh-text-muted truncate">{user.email}</div>
                </motion.div>
              )}
            </div>
            {!isCollapsed && (
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                <LogOut size={16} />
              </button>
            )}
          </div>
        ) : (
          <Button 
            onClick={handleLogin}
            variant="outline" 
            className={cn(
              "w-full border-fh-teal text-fh-teal hover:bg-fh-teal hover:text-white flex items-center justify-center gap-2",
              isCollapsed && "px-0"
            )}
          >
            <LogIn size={16} />
            {!isCollapsed && <span>Sign In</span>}
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
