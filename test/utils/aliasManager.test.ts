import { beforeEach, describe, expect, it } from 'vitest';

import { AliasManager } from '~/routes/terminal/utils/aliasManager';

describe('AliasManager', () => {
  let aliasManager: AliasManager;

  beforeEach(() => {
    aliasManager = new AliasManager();
  });

  describe('setAlias', () => {
    it('should set a valid alias', () => {
      const success = aliasManager.setAlias('ll', 'ls -la');
      expect(success).toBe(true);
      expect(aliasManager.hasAlias('ll')).toBe(true);
    });

    it('should reject invalid alias names', () => {
      expect(aliasManager.setAlias('', 'ls -la')).toBe(false);
      expect(aliasManager.setAlias('123', 'ls -la')).toBe(false);
      expect(aliasManager.setAlias('my-alias', 'ls -la')).toBe(false);
      expect(aliasManager.setAlias('my alias', 'ls -la')).toBe(false);
    });

    it('should reject empty commands', () => {
      expect(aliasManager.setAlias('ll', '')).toBe(false);
      expect(aliasManager.setAlias('ll', '   ')).toBe(false);
    });

    it('should overwrite existing aliases', () => {
      aliasManager.setAlias('ll', 'ls -la');
      aliasManager.setAlias('ll', 'ls -l');

      const alias = aliasManager.getAlias('ll');
      expect(alias?.command).toBe('ls -l');
    });
  });

  describe('getAlias', () => {
    it('should return alias definition', () => {
      aliasManager.setAlias('ll', 'ls -la');

      const alias = aliasManager.getAlias('ll');
      expect(alias).toBeDefined();
      expect(alias?.name).toBe('ll');
      expect(alias?.command).toBe('ls -la');
      expect(alias?.createdAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent alias', () => {
      const alias = aliasManager.getAlias('nonexistent');
      expect(alias).toBeNull();
    });
  });

  describe('removeAlias', () => {
    it('should remove existing alias', () => {
      aliasManager.setAlias('ll', 'ls -la');
      expect(aliasManager.hasAlias('ll')).toBe(true);

      const success = aliasManager.removeAlias('ll');
      expect(success).toBe(true);
      expect(aliasManager.hasAlias('ll')).toBe(false);
    });

    it('should return false for non-existent alias', () => {
      const success = aliasManager.removeAlias('nonexistent');
      expect(success).toBe(false);
    });
  });

  describe('resolveAlias', () => {
    it('should resolve simple alias', () => {
      aliasManager.setAlias('ll', 'ls -la');

      const resolved = aliasManager.resolveAlias('ll');
      expect(resolved).toBe('ls -la');
    });

    it('should resolve alias with arguments', () => {
      aliasManager.setAlias('lsdir', 'ls -la $1');

      const resolved = aliasManager.resolveAlias('lsdir', ['mydir']);
      expect(resolved).toBe('ls -la mydir');
    });

    it('should resolve alias with multiple arguments', () => {
      aliasManager.setAlias('cpf', 'cp $1 $2');

      const resolved = aliasManager.resolveAlias('cpf', ['file1.txt', 'file2.txt']);
      expect(resolved).toBe('cp file1.txt file2.txt');
    });

    it('should resolve alias with $* (all arguments)', () => {
      aliasManager.setAlias('lsall', 'ls -la $*');

      const resolved = aliasManager.resolveAlias('lsall', ['dir1', 'dir2', 'dir3']);
      expect(resolved).toBe('ls -la dir1 dir2 dir3');
    });

    it('should resolve nested aliases', () => {
      aliasManager.setAlias('ll', 'ls -la');
      aliasManager.setAlias('lla', 'll -a');

      const resolved = aliasManager.resolveAlias('lla');
      expect(resolved).toBe('ls -la -a');
    });

    it('should detect circular aliases', () => {
      aliasManager.setAlias('a', 'b');
      aliasManager.setAlias('b', 'a');

      const resolved = aliasManager.resolveAlias('a');
      expect(resolved).toBeNull();
    });

    it('should handle deep recursion', () => {
      for (let i = 0; i < 20; i++) {
        aliasManager.setAlias(`alias${i}`, `alias${i + 1}`);
      }

      const resolved = aliasManager.resolveAlias('alias0');
      expect(resolved).toBeNull();
    });

    it('should return null for non-existent alias', () => {
      const resolved = aliasManager.resolveAlias('nonexistent');
      expect(resolved).toBeNull();
    });
  });

  describe('getAllAliases', () => {
    it('should return empty array when no aliases', () => {
      const aliases = aliasManager.getAllAliases();
      expect(aliases).toEqual([]);
    });

    it('should return all aliases sorted by name', () => {
      aliasManager.setAlias('zz', 'command3');
      aliasManager.setAlias('aa', 'command1');
      aliasManager.setAlias('bb', 'command2');

      const aliases = aliasManager.getAllAliases();
      expect(aliases).toHaveLength(3);
      expect(aliases[0].name).toBe('aa');
      expect(aliases[1].name).toBe('bb');
      expect(aliases[2].name).toBe('zz');
    });
  });

  describe('clearAliases', () => {
    it('should clear all aliases', () => {
      aliasManager.setAlias('ll', 'ls -la');
      aliasManager.setAlias('la', 'ls -a');

      expect(aliasManager.getAllAliases()).toHaveLength(2);

      aliasManager.clearAliases();
      expect(aliasManager.getAllAliases()).toHaveLength(0);
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize aliases', () => {
      aliasManager.setAlias('ll', 'ls -la');
      aliasManager.setAlias('la', 'ls -a');

      const serialized = aliasManager.serialize();
      expect(serialized).toEqual({
        ll: { command: 'ls -la', createdAt: expect.any(String) },
        la: { command: 'ls -a', createdAt: expect.any(String) },
      });

      const newAliasManager = new AliasManager();
      newAliasManager.deserialize(serialized);

      expect(newAliasManager.hasAlias('ll')).toBe(true);
      expect(newAliasManager.hasAlias('la')).toBe(true);
      expect(newAliasManager.getAlias('ll')?.command).toBe('ls -la');
    });

    it('should handle invalid serialized data', () => {
      const invalidData = {
        invalidAlias: { command: '', createdAt: '2023-01-01' }, // empty command
        '123invalid': { command: 'ls', createdAt: '2023-01-01' }, // invalid name
      };

      aliasManager.deserialize(invalidData);
      expect(aliasManager.getAllAliases()).toHaveLength(0);
    });
  });

  describe('getAliasNames', () => {
    it('should return sorted alias names', () => {
      aliasManager.setAlias('zz', 'command3');
      aliasManager.setAlias('aa', 'command1');
      aliasManager.setAlias('bb', 'command2');

      const names = aliasManager.getAliasNames();
      expect(names).toEqual(['aa', 'bb', 'zz']);
    });

    it('should return empty array when no aliases', () => {
      const names = aliasManager.getAliasNames();
      expect(names).toEqual([]);
    });
  });
});
