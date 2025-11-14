export interface Question {
  qNo: number;
  text: string;
  marks: number;
}

export interface QuestionPaper {
  id: string;
  mode: "typed" | "upload";
  questions: Question[];
  totalMarks: number;
  fileUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
