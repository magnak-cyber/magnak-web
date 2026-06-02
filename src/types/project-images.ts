export interface ProjectImageDocument {
  id: string;
  filename: string;
  width: number;
  height: number;
  pixelDataBase64?: string;
  pixels?: number[];
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectImageListItem {
  id: string;
  filename: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt?: string;
  src: string;
  thumbnailSrc: string;
}
