import { http } from '@/utils/request';
import type { Permission, Role, RoleFormData, RoleListResponse, RoleQueryParams } from '@/types/role';

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const toBackendStatus = (status: Role['status'] | undefined): number => {
  return status === 'disabled' ? 0 : 1;
};

const fromBackendStatus = (status: unknown): Role['status'] => {
  return toNumber(status, 1) === 1 ? 'active' : 'disabled';
};

const normalizeRole = (raw: unknown): Role => {
  const item = (raw ?? {}) as Record<string, unknown>;
  const menuIds = Array.isArray(item.menuIds)
    ? item.menuIds
    : Array.isArray(item.permissionIds)
      ? item.permissionIds
      : [];

  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    code: String(item.code ?? ''),
    description: item.remark ? String(item.remark) : item.description ? String(item.description) : undefined,
    status: fromBackendStatus(item.status),
    userCount: toNumber(item.userCount),
    createTime: item.createTime ? String(item.createTime) : undefined,
    permissionIds: menuIds.map((menuId) => toNumber(menuId)).filter((menuId) => menuId > 0),
  };
};

const normalizeRolePage = (raw: unknown, params: RoleQueryParams): RoleListResponse => {
  const page = (unwrapData<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records)
    ? page.records
    : Array.isArray(page.list)
      ? page.list
      : [];

  return {
    list: records.map(normalizeRole),
    total: toNumber(page.total, records.length),
    page: toNumber(page.current ?? page.page ?? page.pageNum, params.page ?? 1),
    pageSize: toNumber(page.size ?? page.pageSize, params.pageSize ?? 10),
  };
};

const mapMenuToPermission = (raw: unknown): Permission => {
  const item = (raw ?? {}) as Record<string, unknown>;
  const children = Array.isArray(item.children) ? item.children.map(mapMenuToPermission) : undefined;
  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    code: item.permission ? String(item.permission) : item.code ? String(item.code) : undefined,
    type: item.type as Permission['type'],
    parentId: item.parentId != null ? toNumber(item.parentId) : null,
    children,
  };
};

const toRolePayload = (data: RoleFormData, id?: number): Record<string, unknown> => ({
  ...(id ? { id } : {}),
  name: data.name,
  code: data.code,
  status: toBackendStatus(data.status),
  remark: data.description,
});

export const getRoleList = async (params: RoleQueryParams) => {
  const response = await http.get<unknown>('/system/role/page', {
    params: {
      pageNum: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      name: params.name ?? params.keyword,
      code: params.code,
      status: params.status ? toBackendStatus(params.status) : undefined,
    },
  });
  return normalizeRolePage(response, params);
};

export const getRoleDetail = async (id: number) => {
  const response = await http.get<unknown>(`/system/role/${id}`);
  return normalizeRole(unwrapData<unknown>(response));
};

export const createRole = async (data: RoleFormData) => {
  const response = await http.post<unknown>('/system/role', toRolePayload(data));
  const payload = unwrapData<unknown>(response);
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return { id: toNumber((payload as { id?: unknown }).id) };
  }
  return { id: 0 };
};

export const updateRole = (id: number, data: RoleFormData) => {
  return http.put('/system/role', toRolePayload(data, id));
};

export const deleteRole = (id: number) => {
  return http.delete(`/system/role/${id}`);
};

export const getPermissionTree = async () => {
  const response = await http.get<unknown>('/system/menu/tree');
  const payload = unwrapData<unknown>(response);
  const list = Array.isArray(payload) ? payload : [];
  return list.map(mapMenuToPermission);
};

export const getRolePermissionIds = async (roleId: number) => {
  const role = await getRoleDetail(roleId);
  return Array.isArray(role.permissionIds) ? role.permissionIds : [];
};

export const assignRolePermissions = async (roleId: number, permissionIds: number[]) => {
  const role = await getRoleDetail(roleId);
  return http.put('/system/role', {
    id: roleId,
    name: role.name,
    code: role.code,
    status: toBackendStatus(role.status),
    remark: role.description,
    menuIds: permissionIds,
  });
};
