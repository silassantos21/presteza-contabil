// ─── Usuário ────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'CLIENT'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: Date
}

export interface AuthPayload {
  sub: string
  email: string
  role: UserRole
  name: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

// ─── Cliente ─────────────────────────────────────────────────────────────────

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING'

export interface Client {
  id: string
  companyName: string
  tradeName?: string
  cnpj?: string
  cpf?: string
  email: string
  phone?: string
  status: ClientStatus
  responsibleName: string
  userId: string
  createdAt: Date
}

// ─── Processo ─────────────────────────────────────────────────────────────────

export type ProcessStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
export type ProcessType =
  | 'IRPF'
  | 'IRPJ'
  | 'MEI'
  | 'NFE'
  | 'NFSE'
  | 'SPED'
  | 'ECAC'
  | 'OTHER'

export interface Process {
  id: string
  title: string
  type: ProcessType
  status: ProcessStatus
  clientId: string
  assignedToId?: string
  dueDate?: Date
  description?: string
  createdAt: Date
  updatedAt: Date
}

// ─── Chat / Mensagens ─────────────────────────────────────────────────────────

export type MessageType = 'TEXT' | 'FILE' | 'SYSTEM'

export interface Conversation {
  id: string
  clientId: string
  createdAt: Date
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: UserRole
  type: MessageType
  content: string
  fileUrl?: string
  fileName?: string
  createdAt: Date
}

// ─── Documento ────────────────────────────────────────────────────────────────

export type DocumentType = 'NFSE' | 'NFE' | 'BOLETO' | 'CONTRATO' | 'GUIA' | 'OUTROS'

export interface Document {
  id: string
  clientId: string
  name: string
  type: DocumentType
  fileUrl: string
  fileSize?: number
  uploadedById: string
  createdAt: Date
}

// ─── Notificação ──────────────────────────────────────────────────────────────

export type NotificationType =
  | 'NEW_MESSAGE'
  | 'NEW_DOCUMENT'
  | 'PROCESS_UPDATE'
  | 'SYSTEM'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  referenceId?: string
  createdAt: Date
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string
  clientId: string
  title: string
  description?: string
  createdAt: Date
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────

export const WS_EVENTS = {
  // Client → Server
  JOIN_CONVERSATION: 'join_conversation',
  SEND_MESSAGE: 'send_message',

  // Server → Client
  NEW_MESSAGE: 'new_message',
  NEW_NOTIFICATION: 'new_notification',
  PROCESS_UPDATED: 'process_updated',
} as const
