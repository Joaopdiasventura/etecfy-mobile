export interface FindSongDto {
  title?: string;
  description?: string;
  artist?: string;
  orderBy?: string;
  limit?: number;
  page?: number;
  search?: string;
}
