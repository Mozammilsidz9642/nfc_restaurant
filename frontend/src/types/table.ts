export interface RestaurantTableItem {
  _id?: string;
  id?: string;
  tableNumber: string;
  name?: string;
  capacity?: number;
  isAvailable?: boolean;
  sortOrder?: number;
  createdAt?: string;
}
