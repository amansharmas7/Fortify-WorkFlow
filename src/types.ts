export interface ProcessTemplate {
  id: string;
  title: string;
  description: string;
  steps: ProcessStep[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  order: number;
  tools?: string[];
  tips?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  templateId: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'viewer';
}
