export type RoleStatus = 'active' | 'disabled';

export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: RoleStatus;
  userCount?: number;
  createTime?: string;
  permissionIds?: number[];
}

export interface Permission {
  id: number;
  name: string;
  code?: string;
  type?: 'menu' | 'button' | 'catalog' | 'api';
  parentId?: number | null;
  children?: Permission[];
}

export interface RoleQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  name?: string;
  code?: string;
  status?: RoleStatus;
}

export interface RoleListResponse {
  list: Role[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface RoleFormData {
  id?: number;
  name: string;
  code: string;
  description?: string;
  status?: RoleStatus;
}
