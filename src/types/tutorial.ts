export interface Tutorial {
  id: string;
  title: string;
  description?: string;
  hotel_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  steps?: TutorialStep[];
}

export interface TutorialStep {
  id: string;
  tutorial_id: string;
  step_number: number;
  title: string;
  content: string;
  image_url?: string;
  question?: string;
  created_at: string;
  options?: TutorialStepOption[];
}

export interface TutorialStepOption {
  id: string;
  step_id: string;
  option_text: string;
  next_step_id?: string;
  order_index: number;
}

export interface CreateTutorialData {
  title: string;
  description?: string;
  steps: CreateStepData[];
}

export interface CreateStepData {
  title: string;
  content: string;
  image_url?: string;
  question?: string;
  options?: CreateOptionData[];
}

export interface CreateOptionData {
  option_text: string;
  next_step_number?: number;
}

export interface TutorialShare {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  source_hotel: { name: string };
  tutorial: { title: string };
}