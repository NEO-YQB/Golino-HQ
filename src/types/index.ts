export type AgentStatus = 'online' | 'working' | 'idle';
export type DepartmentStatus = 'active' | 'busy' | 'idle' | 'warning';

export interface Agent {
  id: string;
  name: string;
  roleFa: string;
  departmentId: string;
  isLead: boolean;
  avatar: string;
  model: string;
  status: AgentStatus;
  specialtyFa: string;
  systemPrompt?: string;
}

export interface Department {
  id: string;
  name: string;
  nameFa: string;
  descriptionFa: string;
  icon: string;
  status: DepartmentStatus;
  leadAgent: Agent;
  members: Agent[];
  activeTasksCount: number;
  errorCount: number;
  color: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'awaiting_approval' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskItem {
  id: string;
  titleFa: string;
  departmentId: string;
  departmentNameFa: string;
  assignedAgentName: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  dueDateFa: string;
  notesFa?: string;
}

export interface ExecutiveReport {
  id: string;
  departmentId: string;
  departmentNameFa: string;
  periodFa: string;
  titleFa: string;
  summaryFa: string;
  accomplishments: string[];
  blockers: string[];
  metrics: {
    label: string;
    value: string;
    change?: string;
  }[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  departmentId: string;
  sender: 'ceo' | 'lead' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  actionsTaken?: string[];
}

export interface BoardroomMessage {
  id: string;
  senderDeptId: string;
  senderName: string;
  senderRoleFa: string;
  text: string;
  timestamp: string;
}

export interface BoardroomActionItem {
  id: string;
  taskFa: string;
  assignedDeptId: string;
  assignedDeptNameFa: string;
  status: 'pending' | 'accepted';
}

export interface BoardroomSession {
  id: string;
  topicFa: string;
  activeDepartmentIds: string[];
  messages: BoardroomMessage[];
  actionItems: BoardroomActionItem[];
  createdAt: string;
}

export interface EscalationMessage {
  id: string;
  departmentId: string;
  departmentNameFa: string;
  senderAgentName: string;
  senderRoleFa: string;
  messageFa: string;
  urgency: 'normal' | 'urgent' | 'critical';
  status: 'unread' | 'read' | 'resolved';
  timestamp: string;
}
