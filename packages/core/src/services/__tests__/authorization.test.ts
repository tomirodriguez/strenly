import { describe, expect, it } from 'vitest'
import { getPermissions, hasHigherOrEqualRole, hasPermission, isValidRole } from '../authorization'

describe('hasPermission', () => {
  describe('owner role', () => {
    it('has all permissions', () => {
      expect(hasPermission('owner', 'organization:delete')).toBe(true)
      expect(hasPermission('owner', 'billing:manage')).toBe(true)
      expect(hasPermission('owner', 'members:update-role')).toBe(true)
    })
  })

  describe('admin role', () => {
    it('has organization manage but not delete', () => {
      expect(hasPermission('admin', 'organization:manage')).toBe(true)
      expect(hasPermission('admin', 'organization:delete')).toBe(false)
    })

    it('has billing read but not manage', () => {
      expect(hasPermission('admin', 'billing:read')).toBe(true)
      expect(hasPermission('admin', 'billing:manage')).toBe(false)
    })

    it('can invite/remove members but not change roles', () => {
      expect(hasPermission('admin', 'members:invite')).toBe(true)
      expect(hasPermission('admin', 'members:remove')).toBe(true)
      expect(hasPermission('admin', 'members:update-role')).toBe(false)
    })

    it('has full athlete/program access', () => {
      expect(hasPermission('admin', 'athletes:write')).toBe(true)
      expect(hasPermission('admin', 'athletes:delete')).toBe(true)
      expect(hasPermission('admin', 'programs:write')).toBe(true)
    })
  })

  describe('member role', () => {
    it('has organization read only', () => {
      expect(hasPermission('member', 'organization:read')).toBe(true)
      expect(hasPermission('member', 'organization:manage')).toBe(false)
      expect(hasPermission('member', 'organization:delete')).toBe(false)
    })

    it('cannot manage billing', () => {
      expect(hasPermission('member', 'billing:read')).toBe(false)
      expect(hasPermission('member', 'billing:manage')).toBe(false)
    })

    it('cannot invite or remove members', () => {
      expect(hasPermission('member', 'members:read')).toBe(true)
      expect(hasPermission('member', 'members:invite')).toBe(false)
      expect(hasPermission('member', 'members:remove')).toBe(false)
    })

    it('cannot delete athletes', () => {
      expect(hasPermission('member', 'athletes:read')).toBe(true)
      expect(hasPermission('member', 'athletes:write')).toBe(true)
      expect(hasPermission('member', 'athletes:delete')).toBe(false)
    })
  })
})

describe('getPermissions', () => {
  it('returns owner permissions', () => {
    const perms = getPermissions('owner')
    expect(perms).toContain('organization:delete')
    expect(perms).toContain('billing:manage')
  })

  it('returns admin permissions', () => {
    const perms = getPermissions('admin')
    expect(perms).toContain('organization:manage')
    expect(perms).not.toContain('organization:delete')
  })

  it('returns member permissions', () => {
    const perms = getPermissions('member')
    expect(perms).toContain('athletes:write')
    expect(perms).not.toContain('athletes:delete')
  })
})

describe('hasHigherOrEqualRole', () => {
  it('owner is higher than admin', () => {
    expect(hasHigherOrEqualRole('owner', 'admin')).toBe(true)
    expect(hasHigherOrEqualRole('admin', 'owner')).toBe(false)
  })

  it('admin is higher than member', () => {
    expect(hasHigherOrEqualRole('admin', 'member')).toBe(true)
    expect(hasHigherOrEqualRole('member', 'admin')).toBe(false)
  })

  it('same role returns true', () => {
    expect(hasHigherOrEqualRole('owner', 'owner')).toBe(true)
    expect(hasHigherOrEqualRole('admin', 'admin')).toBe(true)
    expect(hasHigherOrEqualRole('member', 'member')).toBe(true)
  })
})

describe('isValidRole', () => {
  it('returns true for valid roles', () => {
    expect(isValidRole('owner')).toBe(true)
    expect(isValidRole('admin')).toBe(true)
    expect(isValidRole('member')).toBe(true)
  })

  it('returns false for invalid roles', () => {
    expect(isValidRole('superadmin')).toBe(false)
    expect(isValidRole('viewer')).toBe(false)
    expect(isValidRole('')).toBe(false)
  })
})
