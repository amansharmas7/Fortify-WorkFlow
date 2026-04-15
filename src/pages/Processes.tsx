import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, MoreVertical, FileText, ExternalLink, ChevronRight, Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { auth, db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

interface ProcessDoc {
  id: string;
  title: string;
  description: string;
  status: string;
  authorId: string;
  createdAt: any;
  targetAudience: string;
}

export default function Processes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [processes, setProcesses] = useState<ProcessDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    setIsLoading(true);
    const path = "processes";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    
    unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProcessDoc[];
      setProcesses(docs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const filteredProcesses = processes.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fh-text-dark">Process Library</h1>
          <p className="text-sm text-fh-text-muted">Browse and manage all standardized documentation templates.</p>
        </div>
        <Button 
          className="bg-fh-teal hover:bg-fh-teal-light gap-2"
          onClick={() => navigate("/generate")}
        >
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fh-text-muted" />
          <Input 
            placeholder="Search processes by title, description..." 
            className="pl-10 border-fh-border bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 border-fh-border">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-fh-teal" />
          <p className="text-sm text-fh-text-muted">Loading library...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredProcesses.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed border-fh-border">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-fh-text-dark">No processes found</h3>
              <p className="text-sm text-fh-text-muted">Try adjusting your search or generate a new template.</p>
            </div>
          ) : (
            filteredProcesses.map((process) => (
              <Card key={process.id} className="border-fh-border hover:shadow-sm transition-all group cursor-pointer">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center p-4 gap-4">
                    <div className="w-10 h-10 rounded-lg bg-fh-bg flex items-center justify-center text-fh-teal group-hover:bg-fh-teal group-hover:text-white transition-colors shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-fh-text-dark truncate">{process.title}</h3>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-bold border-fh-border text-fh-text-muted">
                          {process.targetAudience}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-fh-text-muted">
                        <span>Author ID: {process.authorId.slice(0, 8)}...</span>
                        <span>Created: {process.createdAt?.toDate ? process.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        className={`uppercase text-[9px] font-bold tracking-wider ${
                          process.status === 'ready' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                          process.status === 'draft' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 
                          'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        }`}
                      >
                        {process.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-fh-teal">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-fh-teal">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
