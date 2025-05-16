// src/Interface/announcement.interface.ts
export interface Announcement {
  announcement_id: number;
  title: string;
  content: string;
  created_at: Date;
  teacher_name: string;
  subject_name: string;
  subject_id: number;
  teacher_id: number;
}

export interface CreateAnnouncementDTO {
  title: string;
  content: string;
  subject_id: number;
}
