export interface Item {
  id: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  currency: string;
  images: string[];
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemStore {
  feed: Item[];
  loading: boolean;
  error: string | null;
  loadFeed: () => Promise<void>;
  likeItem: (id: string) => Promise<void>;
  passItem: (id: string) => Promise<void>;
  saveItem: (id: string) => Promise<void>;
}