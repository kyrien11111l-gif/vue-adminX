import type { PermissionValue } from '@/types'

export function hasPermission(
  permissions: readonly string[],
  required?: PermissionValue
): boolean {
  if (required === undefined) return true

  const requiredPermissions = Array.isArray(required) ? required : [required]
  return requiredPermissions.length === 0 || requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )
}

export function isPermissionValue(value: unknown): value is PermissionValue {
  return typeof value === 'string' ||
    (Array.isArray(value) && value.every((permission) => typeof permission === 'string'))
}
