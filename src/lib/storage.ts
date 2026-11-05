import fs from 'fs';
import path from 'path';
import {
  Department,
  TaskItem,
  ExecutiveReport,
  EscalationMessage,
  ChatMessage,
  BoardroomSession,
} from '@/types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_TASKS,
  INITIAL_REPORTS,
  INITIAL_ESCALATIONS,
  INITIAL_CHAT_HISTORY,
} from './data';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore if cannot create
    }
  }
}

function readJsonFile<T>(filename: string, fallback: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filename: string, data: T) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
}

// Departments
export function getDepartments(): Department[] {
  return readJsonFile<Department[]>('departments.json', INITIAL_DEPARTMENTS);
}

export function saveDepartments(departments: Department[]) {
  writeJsonFile('departments.json', departments);
}

// Tasks
export function getTasks(): TaskItem[] {
  return readJsonFile<TaskItem[]>('tasks.json', INITIAL_TASKS);
}

export function saveTasks(tasks: TaskItem[]) {
  writeJsonFile('tasks.json', tasks);
}

// Reports
export function getReports(): ExecutiveReport[] {
  return readJsonFile<ExecutiveReport[]>('reports.json', INITIAL_REPORTS);
}

export function saveReports(reports: ExecutiveReport[]) {
  writeJsonFile('reports.json', reports);
}

// Escalations
export function getEscalations(): EscalationMessage[] {
  return readJsonFile<EscalationMessage[]>('escalations.json', INITIAL_ESCALATIONS);
}

export function saveEscalations(escalations: EscalationMessage[]) {
  writeJsonFile('escalations.json', escalations);
}

// 1-on-1 Chat History
export function getChatHistory(deptId: string): ChatMessage[] {
  const allChats = readJsonFile<Record<string, ChatMessage[]>>(
    'chats.json',
    INITIAL_CHAT_HISTORY
  );
  return allChats[deptId] || [];
}

export function addChatMessage(deptId: string, message: ChatMessage) {
  const allChats = readJsonFile<Record<string, ChatMessage[]>>(
    'chats.json',
    INITIAL_CHAT_HISTORY
  );
  if (!allChats[deptId]) {
    allChats[deptId] = [];
  }
  allChats[deptId].push(message);
  writeJsonFile('chats.json', allChats);
}

// Boardrooms
export function getBoardroomSessions(): BoardroomSession[] {
  return readJsonFile<BoardroomSession[]>('boardroom.json', []);
}

export function saveBoardroomSession(session: BoardroomSession) {
  const sessions = getBoardroomSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  writeJsonFile('boardroom.json', sessions);
}
