export interface BookCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionPayload {
  name: string;
  description?: string;
}

export interface UpdateCollectionPayload extends CreateCollectionPayload {
  id: string;
}
