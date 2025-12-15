// Task Template Types

/**
 * Task frequency options
 */
export type TaskFrequency = 
  | 'OneTime'
  | 'Daily'
  | 'Weekly'
  | 'BiWeekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Yearly';

/**
 * Task template entity
 */
export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  difficultyLevel: number; // 1-10
  estimatedDurationMinutes?: number;
  defaultFrequency: TaskFrequency;
  isSystemTemplate: boolean;
  groupId?: string; // null if isSystemTemplate=true
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  isDeleted: boolean;
}

/**
 * Template with populated category data
 */
export interface TaskTemplateWithCategory extends TaskTemplate {
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
}

/**
 * Request to create a new group-specific template
 */
export interface CreateTemplateRequest {
  name: string;
  description?: string;
  categoryId?: string;
  difficultyLevel: number;
  estimatedDurationMinutes?: number;
  defaultFrequency: TaskFrequency;
}

/**
 * Request to update an existing group-specific template
 */
export interface UpdateTemplateRequest {
  name: string;
  description?: string;
  categoryId?: string;
  difficultyLevel: number;
  estimatedDurationMinutes?: number;
  defaultFrequency: TaskFrequency;
}

/**
 * Query parameters for filtering templates
 */
export interface GetTemplatesParams {
  groupId: string;
  categoryId?: string;
  difficultyMin?: number;
  difficultyMax?: number;
  frequency?: TaskFrequency;
}

/**
 * Response from templates list endpoint
 */
export interface TemplatesResponse {
  templates: TaskTemplate[];
  total: number;
}
