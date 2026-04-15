import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GitBranch, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  Users as UsersIcon,
  MoreVertical,
  Loader2,
  Plus
} from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

interface WorkflowDoc {
  id: string;
  processId: string;
  title: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  assignedTo: string[];
  startedAt: any;
  lastUpdated: any;
}

export default function Workflows() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    setIsLoading(true);
    const path = "workflows";
    const q = query(collection(db, path), orderBy("lastUpdated", "desc"));
    
    unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkflowDoc[];
      setWorkflows(docs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-fh-text-dark">Active Workflows</h1>
          <p className="text-sm text-fh-text-muted">Track real-time execution of standardized processes.</p>
        </div>
        <Button 
          className="bg-fh-teal hover:bg-fh-teal-light gap-2"
          onClick={() => navigate("/processes")}
        >
          <Play className="w-4 h-4" />
          Start New Workflow
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-fh-teal" />
          <p className="text-sm text-fh-text-muted">Loading workflows...</p>
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed border-fh-border">
          <GitBranch className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-fh-text-dark">No active workflows</h3>
          <p className="text-sm text-fh-text-muted">Launch a workflow from the Process Library to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: WorkflowDoc }) {
  const statusConfig = {
    active: { icon: <Play className="w-3 h-3" />, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Active" },
    paused: { icon: <Pause className="w-3 h-3" />, color: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Paused" },
    completed: { icon: <CheckCircle2 className="w-3 h-3" />, color: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Completed" },
  };

  const config = statusConfig[workflow.status];

  return (
    <Card className="border-fh-border hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <Badge className={`gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
            {config.icon}
            {config.label}
          </Badge>
          <CardTitle className="text-base font-bold text-fh-text-dark leading-tight pt-1">
            {workflow.title}
          </CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-fh-text-muted">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-fh-text-muted font-medium">Overall Progress</span>
            <span className="font-bold text-fh-teal">{workflow.progress}%</span>
          </div>
          <Progress value={workflow.progress} className="h-1.5 bg-muted" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-fh-border/50">
          <div className="flex -space-x-2">
            {workflow.assignedTo.map((id, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold text-fh-text-muted">
                {id.charAt(0).toUpperCase()}
              </div>
            ))}
            <div className="w-7 h-7 rounded-full bg-fh-teal/10 border-2 border-card flex items-center justify-center text-[10px] font-bold text-fh-teal">
              <Plus className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-fh-text-muted font-medium">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {workflow.lastUpdated?.toDate ? workflow.lastUpdated.toDate().toLocaleDateString() : 'Just now'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
