// src/hooks/useRoles.ts
import { usePublicFetch } from './usePublicFetch';
import { Role, Auth } from '../types/auth';
import { AUTH_TYPES } from '../constants/auth';

interface UseRolesReturn {
  roles: Role[] | undefined;
  isLoading: boolean;
  error: any;
  mutate: () => void;
  getRole: (id: string) => Role | undefined;
  getRoleAuths: (id: string) => Auth[] | undefined;
  checkRoleAuth: (roleId: string, authName: string, authType: number) => boolean;
}

export const useRoles = (): UseRolesReturn => {
  const {
    data: roles,
    isLoading,
    error,
    mutate,
  } = usePublicFetch<Role[]>(`${process.env.REACT_APP_API_URL}/api/role`);

  const getRole = (id: string) => roles?.find(role => role.id === id);

  const getRoleAuths = (id: string) => getRole(id)?.auth;

  const checkRoleAuth = (roleId: string, authName: string, authType: number): boolean => {
    const roleAuths = getRoleAuths(roleId);
    if (!roleAuths) return false;

    const auth = roleAuths.find(a => a.authName === authName);
    if (!auth) return false;

    return auth.authTypes.some(type => (type & authType) === authType);
  };

  return {
    roles,
    isLoading,
    error,
    mutate,
    getRole,
    getRoleAuths,
    checkRoleAuth,
  };
};

// Re-export 供便利使用
export { AUTH_TYPES };