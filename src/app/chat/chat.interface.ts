export interface SendMessage {
  chat_id: number;
  sender_id: number;
  content: string;
  attachment_url: string | null;
  room_code: string;
}
