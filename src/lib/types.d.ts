export type Post = {
  title: string;
  slug: string;
  date: string;
  tags?: string[];
  description: string;
  body: string;
  lastModified?: number;
  publishDate: string;
  published?: boolean;
};
