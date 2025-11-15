export enum MessageRole {
  User = 'user',
  Model = 'model',
  System = 'system'
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'Sensory' | 'Executive Function' | 'Social' | 'Workplace' | 'Education' | 'Mental Health' | 'Web Resource' | 'Academic/Health';
  url: string;
  tags: string[];
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  relatedResources?: Resource[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}