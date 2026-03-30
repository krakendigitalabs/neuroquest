import { describe, expect, it } from 'vitest';
import {
  canCommentInWorkspace,
  canEditWorkspaceContent,
  canManageWorkspaceUsers,
  getAssignableAccountRoles,
  hasMinimumAccountRole,
  isAccountRole,
} from './account-role';

describe('account role helpers', () => {
  it('orders account roles hierarchically', () => {
    expect(hasMinimumAccountRole('owner', 'manager')).toBe(true);
    expect(hasMinimumAccountRole('manager', 'administrator')).toBe(true);
    expect(hasMinimumAccountRole('editor', 'administrator')).toBe(false);
    expect(hasMinimumAccountRole('viewer', 'viewer')).toBe(true);
  });

  it('derives workspace capabilities from the account role', () => {
    expect(canManageWorkspaceUsers('owner')).toBe(true);
    expect(canManageWorkspaceUsers('administrator')).toBe(true);
    expect(canManageWorkspaceUsers('editor')).toBe(false);
    expect(canEditWorkspaceContent('editor')).toBe(true);
    expect(canEditWorkspaceContent('commentator')).toBe(false);
    expect(canCommentInWorkspace('commentator')).toBe(true);
    expect(canCommentInWorkspace('viewer')).toBe(false);
  });

  it('validates only supported account-role values', () => {
    expect(isAccountRole('owner')).toBe(true);
    expect(isAccountRole('manager')).toBe(true);
    expect(isAccountRole('random')).toBe(false);
    expect(isAccountRole(null)).toBe(false);
  });

  it('limits which account roles can be assigned by each privileged role', () => {
    expect(getAssignableAccountRoles('owner')).toContain('owner');
    expect(getAssignableAccountRoles('manager')).not.toContain('owner');
    expect(getAssignableAccountRoles('administrator')).toEqual(['editor', 'commentator', 'viewer']);
    expect(getAssignableAccountRoles('viewer')).toEqual([]);
  });
});
