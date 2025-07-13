import { beforeEach, describe, expect, it } from 'vitest';

import { createDefaultFilesystem } from '~/constants/defaultFilesystems';
import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { AliasManager } from '~/routes/terminal/utils/aliasManager';
import { executeCommand } from '~/routes/terminal/utils/commands';

/**
 * Tests spécifiques pour valider la correction du bug des alias avec chaining.
 * Bug original: Les alias contenant des opérateurs de chaining (&&, ||, ;)
 * n'exécutaient que la première commande.
 */
describe('Alias Chaining Solution Tests', () => {
  let filesystem: FileSystemState;
  let aliasManager: AliasManager;

  beforeEach(() => {
    filesystem = {
      root: createDefaultFilesystem(),
      currentPath: ['home', 'user'],
    };
    aliasManager = new AliasManager();
  });

  describe('Original problem case', () => {
    it('should execute both cd and ls in alias work="cd documents/projects && ls"', () => {
      // Créer le dossier projects pour le test
      const createResult = executeCommand('mkdir -p documents/projects', filesystem, aliasManager);
      expect(createResult.success).toBe(true);

      // Créer l'alias problématique original
      aliasManager.setAlias('work', 'cd documents/projects && ls');

      // Réinitialiser le chemin
      filesystem.currentPath = ['home', 'user'];

      // Exécuter l'alias
      const result = executeCommand('work', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Vérifier que cd a fonctionné (changement de répertoire)
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents', 'projects']);
      // Vérifier que ls a été exécuté (il y a un output)
      expect(typeof result.output === 'string' || Array.isArray(result.output)).toBe(true);
    });

    it('should show projects directory content after work alias execution', () => {
      // Créer le dossier et ajouter des fichiers
      executeCommand('mkdir -p documents/projects', filesystem, aliasManager);
      executeCommand('touch documents/projects/file1.txt', filesystem, aliasManager);
      executeCommand('touch documents/projects/file2.txt', filesystem, aliasManager);

      // Créer et exécuter l'alias
      aliasManager.setAlias('work', 'cd documents/projects && ls');
      filesystem.currentPath = ['home', 'user'];

      const result = executeCommand('work', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Vérifier que nous sommes dans le bon répertoire
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents', 'projects']);

      // Vérifier que ls a listé les fichiers
      const outputText = Array.isArray(result.output) ? result.output.map((segment) => segment.text).join('') : result.output;
      expect(outputText).toContain('file1.txt');
      expect(outputText).toContain('file2.txt');
    });
  });

  describe('Edge cases for chaining fix', () => {
    it('should handle failure in first command of && chain', () => {
      aliasManager.setAlias('failchain', 'cd nonexistent && echo "this should not appear"');

      const result = executeCommand('failchain', filesystem, aliasManager);

      // Le cd devrait échouer, donc echo ne devrait pas s'exécuter
      expect(result.success).toBe(false);
      const outputText = Array.isArray(result.output) ? result.output.map((segment) => segment.text).join('') : result.output;
      expect(outputText).not.toContain('this should not appear');
    });

    it('should handle success in first command causing || chain to skip', () => {
      aliasManager.setAlias('skipchain', 'cd documents || echo "fallback executed"');

      const result = executeCommand('skipchain', filesystem, aliasManager);

      // Le cd devrait réussir, donc echo ne devrait pas s'exécuter
      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents']);
      const outputText = Array.isArray(result.output) ? result.output.map((segment) => segment.text).join('') : result.output;
      expect(outputText).not.toContain('fallback executed');
    });

    it('should handle complex chaining with mixed operators', () => {
      // Test plus simple et plus réaliste
      aliasManager.setAlias('complex', 'cd documents && echo "in documents" ; echo "final step"');

      const result = executeCommand('complex', filesystem, aliasManager);

      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents']);

      const outputText = Array.isArray(result.output) ? result.output.map((segment) => segment.text).join('') : result.output;
      expect(outputText).toContain('in documents');
      expect(outputText).toContain('final step');
    });
  });

  describe('Regression tests', () => {
    it('should still work with simple aliases without chaining', () => {
      aliasManager.setAlias('ll', 'ls -la');

      const result = executeCommand('ll', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Should execute normal ls -la command
      expect(typeof result.output === 'string' || Array.isArray(result.output)).toBe(true);
    });

    it('should still work with alias arguments', () => {
      aliasManager.setAlias('lsdir', 'ls -la $1');

      const result = executeCommand('lsdir documents', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Should execute ls -la documents
    });
  });
});
