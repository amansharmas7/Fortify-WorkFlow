import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Download, 
  Plus, 
  Loader2, 
  ChevronRight, 
  ChevronDown, 
  FileText,
  Copy,
  Check,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateProcessTemplate, ProcessTemplate } from "@/src/lib/gemini";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Generate() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState<ProcessTemplate | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTemplate(null);
    try {
      const result = await generateProcessTemplate(prompt);
      setTemplate(result);
      toast.success("Process documentation generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate documentation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!template) return;

    setIsSaving(true);
    const path = "processes";
    try {
      await addDoc(collection(db, path), {
        ...template,
        authorId: auth.currentUser?.uid || "guest_user",
        createdAt: serverTimestamp(),
        status: "draft"
      });
      toast.success("Saved to library!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!template) return;
    const text = `${template.title}\n\n${template.description}\n\n` + 
      template.steps.map((s, i) => `${i+1}. ${s.title}\n${s.description}`).join('\n\n');
    
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

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
          <Button className="bg-fh-teal hover:bg-fh-teal-light">
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* AI Bar */}
        <div className="bg-white border border-dashed border-fh-teal-light rounded-lg p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-xl">✨</div>
            <h2 className="text-sm font-bold text-fh-teal uppercase tracking-wider">AI Process Generator</h2>
          </div>
          <Textarea 
            placeholder="Describe a process (e.g., 'Weekly micronutrient supply chain audit')..." 
            className="min-h-[100px] border-fh-border bg-slate-50/50 focus-visible:ring-fh-teal text-sm resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-fh-text-muted hover:text-fh-teal"
              onClick={() => setPrompt("Onboarding process for a new Field Officer at Fortify Health, including equipment setup and first-week training.")}
            >
              Try a sample prompt
            </Button>
            <Button 
              className="bg-fh-teal hover:bg-fh-teal-light text-sm px-6"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Documentation
                </>
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {template && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-fh-text-dark">Generated Template</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={copyToClipboard}>
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? "Copied" : "Copy Text"}
                  </Button>
                  <Button 
                    className="bg-fh-teal hover:bg-fh-teal-light gap-2"
                    onClick={handleSaveToLibrary}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save to Library
                  </Button>
                </div>
              </div>

              <Card className="border-fh-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-fh-teal">{template.title}</CardTitle>
                    <p className="text-sm text-fh-text-muted mt-1">{template.description}</p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                    AI Generated
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Audience</span>
                    <p className="text-sm mt-1">{template.targetAudience}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-fh-text-dark uppercase tracking-wider">Workflow Steps</h3>
                    <div className="space-y-3">
                      {template.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-4 p-4 border border-fh-border rounded-lg bg-white hover:border-fh-teal transition-colors group">
                          <div className="w-8 h-8 rounded-full bg-fh-bg flex items-center justify-center text-fh-teal font-bold text-sm shrink-0 group-hover:bg-fh-teal group-hover:text-white transition-colors">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-sm">{step.title}</h4>
                              <Badge variant="outline" className="text-[10px] font-bold uppercase">{step.role}</Badge>
                            </div>
                            <p className="text-xs text-fh-text-muted mt-1 leading-relaxed">{step.description}</p>
                            {step.tools && step.tools.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {step.tools.map((tool, tIdx) => (
                                  <span key={tIdx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
