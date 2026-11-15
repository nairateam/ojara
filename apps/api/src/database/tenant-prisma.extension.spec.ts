import { describe, expect, it } from 'vitest';
import { CrossTenantAccessError, scopeArgs } from './tenant-prisma.extension.js';

describe('scopeArgs (tenant extension)', () => {
  it('forces storeId into reads and rejects filters for another store', () => {
    expect(scopeArgs('Product', 'findMany', { where: { status: 'PUBLISHED' } }, 'A')).toEqual({
      where: { storeId: 'A', status: 'PUBLISHED' },
    });
    expect(() => scopeArgs('Product', 'findMany', { where: { storeId: 'B' } }, 'A')).toThrow(CrossTenantAccessError);
    expect(scopeArgs('Product', 'count', undefined, 'A')).toEqual({ where: { storeId: 'A' } });
  });

  it('scopes unique lookups, updates and deletes', () => {
    expect(scopeArgs('Order', 'findUnique', { where: { id: 'o1' } }, 'A')).toEqual({ where: { id: 'o1', storeId: 'A' } });
    expect(scopeArgs('Order', 'update', { where: { id: 'o1' }, data: { notes: 'x' } }, 'A')).toEqual({
      where: { id: 'o1', storeId: 'A' },
      data: { notes: 'x' },
    });
    expect(scopeArgs('Order', 'deleteMany', {}, 'A')).toEqual({ where: { storeId: 'A' } });
  });

  it('stamps storeId on creates and rejects writes for another store', () => {
    expect(scopeArgs('Category', 'create', { data: { name: 'Bags' } }, 'A')).toEqual({ data: { name: 'Bags', storeId: 'A' } });
    expect(scopeArgs('Category', 'createMany', { data: [{ name: 'a' }, { name: 'b' }] }, 'A')).toEqual({
      data: [
        { name: 'a', storeId: 'A' },
        { name: 'b', storeId: 'A' },
      ],
    });
    expect(() => scopeArgs('Category', 'create', { data: { name: 'x', storeId: 'B' } }, 'A')).toThrow(CrossTenantAccessError);
    expect(() => scopeArgs('Category', 'create', { data: { name: 'x', store: { connect: { id: 'B' } } } }, 'A')).toThrow(
      CrossTenantAccessError,
    );
    expect(() => scopeArgs('Category', 'update', { where: { id: 'c' }, data: { storeId: 'B' } }, 'A')).toThrow(
      CrossTenantAccessError,
    );
  });

  it('scopes upserts on both branches', () => {
    expect(scopeArgs('Customer', 'upsert', { where: { id: 'c' }, create: { name: 'Tolu' }, update: { name: 'T' } }, 'A')).toEqual({
      where: { id: 'c', storeId: 'A' },
      create: { name: 'Tolu', storeId: 'A' },
      update: { name: 'T' },
    });
  });
});
