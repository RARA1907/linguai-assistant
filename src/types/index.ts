/**
 * Shared TypeScript types
 */

// File metadata (stored in DB for display in history)
export interface FileMetadata {
  id: string
  fileName: string
  fileType: string
  fileSize: number
}

// Chat types
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  files?: FileMetadata[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

// User (if using auth)
export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: "free" | "premium" | "admin";
  createdAt: string;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}
