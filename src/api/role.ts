import { http } from '@/utils/request';
import type { Permission, Role, RoleFormData, RoleListResponse, RoleQueryParams } from '@/types/role';

export const getRoleList = (params: RoleQueryParams) => {
  return http.get<RoleListResponse>('/system/role/list', { params });
};

export const getRoleDetail = (id: number) => {
  return http.get<Role>(`/system/role/${id}`);
};

export const createRole = (data: RoleFormData) => {
  return http.post<{ id: number }>('/system/role', data);
};

export const updateRole = (id: number, data: RoleFormData) => {
  return http.put(`/system/role/${id}`, data);
};

export const deleteRole = (id: number) => {
  return http.delete(`/system/role/${id}`);
};

export const getPermissionTree = () => {
  return http.get<Permission[]>('/system/permission/tree');
};

export const getRolePermissionIds = (roleId: number) => {
  return http.get<number[] | { permissionIds?: number[] }>(`/system/role/${roleId}/permissions`);
};

export const assignRolePermissions = (roleId: number, permissionIds: number[]) => {
  return http.put(`/system/role/${roleId}/permissions`, { permissionIds });
};
