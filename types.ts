
export enum UserRole {
  ADMIN = 'ADMIN',
  IMPORTER = 'IMPORTER',
  EXPORTER = 'EXPORTER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  enabled: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  type: 'import' | 'export';
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface AppState {
  users: User[];
  inventory: Product[];
  transactions: Transaction[];
  currentUser: User | null;
}
