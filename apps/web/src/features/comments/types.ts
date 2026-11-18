export interface CommentPage {
  items: Comment[];
  nextCursor: string | null; // null = last page
}

export interface Comment {
  id: string;
  bearId: string;
  author: string;
  text: string;
  createdAt: string;
}
