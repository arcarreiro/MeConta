
export enum Role {
  STUDENT = 'STUDENT',
  MONITOR = 'MONITOR',
  ADMIN = 'ADMIN'
}

export enum RoundStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  groupId?: string;
  bio?: string;
  curricularInfo?: string;
  resumeUrl?: string; 
  photoUrl?: string; 
}

export interface Group {
  id: string;
  name: string;
  monitorIds: string[];
}

export interface FeedbackRound {
  id: string;
  name: string; 
  deadline: number; 
  groupId: string;
  status: RoundStatus;
  createdAt: number;
}

export interface FeedbackAssignment {
  id: string;
  roundId: string;
  giverId: string;
  receiverId: string;
  content: string;
  status: 'PENDING' | 'SUBMITTED';
  isFromMonitor: boolean;
  isToMonitor?: boolean;
}

export interface CourseEvaluation {
  id: string;
  roundId: string;
  studentId: string;
  q1: { score: number; comment: string };
  q2: { score: number; comment: string };
  q3: { score: number; comment: string };
}

export interface SynthesizedReport {
  id: string;
  targetId: string; 
  roundId: string | string[]; 
  content: string; 
  evolution?: string; 
  createdAt: number;
  type: 'STUDENT' | 'MONITOR' | 'TRAJECTORY' | 'COURSE';
  isApproved?: boolean;
}
