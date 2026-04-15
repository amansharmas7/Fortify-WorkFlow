import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users as UsersIcon, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical,
  Loader2,
  Search
} from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, onSnapshot, query, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'editor' | 'viewer';
}

export default function Team() {
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (unsubscribeSnapshot) unsubscribeSnapshot();

      if (user) {
        // Sync user to firestore if not exists
        const userRef = doc(db, "users", user.uid);
        try {
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            const newUser: UserProfile = {
              id: user.uid,
              displayName: user.displayName || "Anonymous User",
              email: user.email || "",
              photoURL: user.photoURL || "",
              role: user.email === "amanforcodeing@gmail.com" ? "admin" : "viewer"
            };
            await setDoc(userRef, newUser);
          } else {
            setIsAdmin(userSnap.data().role === 'admin');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }

        // Start listener only if authenticated
        const path = "users";
        const q = query(collection(db, path));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as UserProfile[];
          setTeam(docs);
          setIsLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, path);
        });
      } else {
        setTeam([]);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const updateRole = async (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    if (!isAdmin) {
      toast.error("Only admins can change roles.");
      return;
    }
    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, "users", userId), { role: newRole }, { merge: true });
      toast.success("Role updated successfully.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-fh-text-dark">Team & Roles</h1>
          <p className="text-sm text-fh-text-muted">Manage team access and collaboration permissions.</p>
        </div>
        <Button className="bg-fh-teal hover:bg-fh-teal-light gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-fh-border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-bold">Organization Directory</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fh-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="w-full pl-9 pr-4 py-1.5 text-xs border border-fh-border rounded-lg bg-muted/30 focus:outline-none focus:ring-1 focus:ring-fh-teal"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-fh-teal" />
                  <p className="text-sm text-fh-text-muted">Loading team directory...</p>
                </div>
              ) : !currentUser ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
                  <Shield className="w-12 h-12 text-muted-foreground/30" />
                  <h3 className="text-lg font-bold text-fh-text-dark">Authentication Required</h3>
                  <p className="text-sm text-fh-text-muted max-w-xs">
                    The team directory contains sensitive information. Please sign in to view members and roles.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-fh-border">
                  {team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        {member.photoURL ? (
                          <img src={member.photoURL} alt={member.displayName} className="w-10 h-10 rounded-full border border-fh-border" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-fh-teal/10 flex items-center justify-center text-fh-teal font-bold">
                            {member.displayName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-fh-text-dark">{member.displayName}</div>
                          <div className="text-[11px] text-fh-text-muted flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={`text-[9px] font-bold uppercase tracking-widest ${
                            member.role === 'admin' ? 'bg-fh-accent/10 text-fh-accent border-fh-accent/20' :
                            member.role === 'editor' ? 'bg-fh-teal/10 text-fh-teal border-fh-teal/20' :
                            'bg-muted text-fh-text-muted border-fh-border'
                          }`}>
                            <Shield className="w-2.5 h-2.5 mr-1" />
                            {member.role}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-fh-text-muted">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-fh-border shadow-sm bg-fh-bg/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Role Definitions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-fh-accent uppercase tracking-wider">Admin</div>
                <p className="text-[10px] text-fh-text-muted leading-relaxed">Full access to system settings, user management, and all documentation.</p>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-fh-teal uppercase tracking-wider">Editor</div>
                <p className="text-[10px] text-fh-text-muted leading-relaxed">Can generate, edit, and save process templates and manuals.</p>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Viewer</div>
                <p className="text-[10px] text-fh-text-muted leading-relaxed">Read-only access to the library and active workflow tracking.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
