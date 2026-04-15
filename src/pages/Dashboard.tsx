import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Download,
  Settings,
  LayoutDashboard,
  Loader2,
  GitBranch,
  Library,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { auth, db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

interface RecentDoc {
  id: string;
  title: string;
  authorId: string;
  createdAt: any;
  status: string;
}

export default function Dashboard() {
  const [recentItems, setRecentItems] = useState<RecentDoc[]>([]);
  const [workflowCount, setWorkflowCount] = useState<number>(0);
  const [teamCount, setTeamCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribeRecent: (() => void) | null = null;
    let unsubscribeWorkflows: (() => void) | null = null;
    let unsubscribeTeam: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Team count only if authenticated
      if (currentUser) {
        unsubscribeTeam = onSnapshot(collection(db, "users"), (snapshot) => {
          setTeamCount(snapshot.size);
        });
      } else {
        setTeamCount(0);
        if (unsubscribeTeam) unsubscribeTeam();
      }
    });

    setIsLoading(true);
    
    // Recent Items
    const recentQ = query(collection(db, "processes"), orderBy("createdAt", "desc"), limit(5));
    unsubscribeRecent = onSnapshot(recentQ, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RecentDoc[];
      setRecentItems(docs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "processes");
    });

    // Workflow Count
    unsubscribeWorkflows = onSnapshot(collection(db, "workflows"), (snapshot) => {
      setWorkflowCount(snapshot.size);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRecent) unsubscribeRecent();
      if (unsubscribeWorkflows) unsubscribeWorkflows();
      if (unsubscribeTeam) unsubscribeTeam();
    };
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-fh-text-dark">Documentation Engine</h1>
          <p className="text-sm text-fh-text-muted">Standardizing global health processes through AI.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-fh-border">
            <Download className="mr-2 h-4 w-4" /> Export Library
          </Button>
          <Link to="/generate">
            <Button className="bg-fh-teal hover:bg-fh-teal-light">
              <Plus className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModuleCard 
          title="Active Workflows" 
          desc="Track real-time execution of processes." 
          icon={<GitBranch className="text-fh-teal" size={24} />}
          path="/workflows"
          count={`${workflowCount} Active`}
        />
        <ModuleCard 
          title="Team & Roles" 
          desc="Manage permissions and team access." 
          icon={<Users className="text-fh-teal" size={24} />}
          path="/team"
          count={`${teamCount} Members`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-fh-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Documentation</CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold">
                {recentItems.length} Recent
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-fh-border">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-fh-teal" />
                      <p className="text-sm text-fh-text-muted">Fetching updates...</p>
                    </div>
                  ) : recentItems.length === 0 ? (
                    <div className="p-12 text-center text-fh-text-muted text-sm">
                      No documentation yet. Start by generating one!
                    </div>
                  ) : (
                    recentItems.map((item) => (
                      <RecentItem 
                        key={item.id} 
                        icon={<FileText className="text-fh-teal" size={18} />}
                        title={item.title}
                        meta={`Created ${item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'} • By ${item.authorId.slice(0, 8)}...`}
                        status={item.status}
                        statusType={item.status}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* AI Usage Card */}
          <Card className="bg-fh-teal text-white border-none shadow-md overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={80} />
            </div>
            <CardContent className="p-6">
              <div className="text-xs opacity-80 mb-2 uppercase tracking-wider font-bold">AI Usage This Month</div>
              <div className="text-3xl font-bold mb-3">84%</div>
              <div className="w-full h-1.5 bg-white/20 rounded-full mb-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "84%" }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <div className="text-[11px] opacity-80">42 of 50 tokens used. Reset in 12 days.</div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-fh-text-muted uppercase tracking-widest px-1">Quick Tasks</h3>
            <div className="space-y-3">
              <QuickAction 
                title="Create New Workflow" 
                desc="Launch a new instance from an existing process template." 
                path="/processes"
              />
              <QuickAction 
                title="Review Process Templates" 
                desc="Audit and update standardized health protocols." 
                path="/processes"
              />
              <QuickAction 
                title="Manage Team Access" 
                desc="Update roles and permissions for health workers." 
                path="/team"
              />
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              System Update Required
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">Documentation Service v2.4 is available. Performance improvements for AI generation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentItem({ icon, title, meta, status, statusType }: { 
  icon: React.ReactNode, 
  title: string, 
  meta: string, 
  status: string,
  statusType: string
}) {
  const statusStyles: Record<string, string> = {
    ready: "bg-emerald-50 text-emerald-700 border-emerald-100",
    draft: "bg-amber-50 text-amber-700 border-amber-100",
    review: "bg-blue-50 text-blue-700 border-blue-100"
  };

  return (
    <Link to="/processes">
      <div className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-card group-hover:shadow-sm transition-all">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate text-fh-text-dark">{title}</div>
          <div className="text-[11px] text-fh-text-muted mt-0.5">{meta}</div>
        </div>
        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${statusStyles[statusType]}`}>
          {status}
        </Badge>
        <ChevronRight size={14} className="text-slate-300 ml-2" />
      </div>
    </Link>
  );
}

function QuickAction({ title, desc, path }: { title: string, desc: string, path?: string }) {
  const content = (
    <div className="p-4 bg-card border border-fh-border rounded-xl cursor-pointer hover:border-fh-teal hover:bg-accent/30 transition-all group shadow-sm h-full">
      <div className="text-sm font-semibold text-fh-text-dark group-hover:text-fh-teal transition-colors">{title}</div>
      <div className="text-[11px] text-fh-text-muted mt-1 leading-relaxed">{desc}</div>
    </div>
  );

  if (path) {
    return <Link to={path}>{content}</Link>;
  }

  return content;
}

function ModuleCard({ title, desc, icon, path, count }: { title: string, desc: string, icon: React.ReactNode, path: string, count: string }) {
  return (
    <Link to={path} className="block h-full">
      <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Card className="h-full border-fh-border hover:border-fh-teal hover:shadow-lg transition-all group cursor-pointer overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-fh-bg flex items-center justify-center group-hover:bg-fh-teal group-hover:text-white transition-colors">
                {icon}
              </div>
              <Badge variant="secondary" className="bg-muted text-fh-text-muted text-[10px] font-bold uppercase tracking-wider">
                {count}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-fh-text-dark group-hover:text-fh-teal transition-colors mb-1">{title}</h3>
            <p className="text-xs text-fh-text-muted leading-relaxed">{desc}</p>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
