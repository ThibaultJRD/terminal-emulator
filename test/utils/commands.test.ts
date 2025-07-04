import { describe, it, expect, beforeEach } from 'vitest'
import { commands } from '~/routes/terminal/utils/commands'
import { createDefaultFileSystem } from '~/routes/terminal/utils/filesystem'
import type { FileSystemState } from '~/routes/terminal/types/filesystem'

describe('Commands', () => {
  let filesystem: FileSystemState

  beforeEach(() => {
    filesystem = createDefaultFileSystem()
  })

  describe('cd command', () => {
    it('should change to home directory with no arguments', () => {
      filesystem.currentPath = ['tmp']
      const result = commands.cd([], filesystem)
      expect(result.success).toBe(true)
      expect(filesystem.currentPath).toEqual(['home', 'user'])
    })

    it('should change to specified directory', () => {
      const result = commands.cd(['documents'], filesystem)
      expect(result.success).toBe(true)
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents'])
    })

    it('should handle absolute paths', () => {
      const result = commands.cd(['/tmp'], filesystem)
      expect(result.success).toBe(true)
      expect(filesystem.currentPath).toEqual(['tmp'])
    })

    it('should fail for non-existent directory', () => {
      const result = commands.cd(['nonexistent'], filesystem)
      expect(result.success).toBe(false)
      expect(result.error).toContain('no such file or directory')
    })

    it('should fail when trying to cd into a file', () => {
      const result = commands.cd(['documents/readme.txt'], filesystem)
      expect(result.success).toBe(false)
      expect(result.error).toContain('not a directory')
    })
  })

  describe('ls command', () => {
    it('should list directory contents', () => {
      const result = commands.ls([], filesystem)
      expect(result.success).toBe(true)
      expect(Array.isArray(result.output)).toBe(true)
    })

    it('should show hidden files with -a flag', () => {
      const result = commands.ls(['-a'], filesystem)
      expect(result.success).toBe(true)
      // Should include .secret file
      const output = result.output as any[]
      const hasHiddenFile = output.some(segment => 
        segment.text && segment.text.includes('.secret')
      )
      expect(hasHiddenFile).toBe(true)
    })

    it('should show detailed information with -l flag', () => {
      const result = commands.ls(['-l'], filesystem)
      expect(result.success).toBe(true)
      expect(Array.isArray(result.output)).toBe(true)
    })

    it('should combine flags (-la)', () => {
      const result = commands.ls(['-la'], filesystem)
      expect(result.success).toBe(true)
      expect(Array.isArray(result.output)).toBe(true)
    })

    it('should list specific directory', () => {
      const result = commands.ls(['documents'], filesystem)
      expect(result.success).toBe(true)
    })

    it('should fail for non-existent directory', () => {
      const result = commands.ls(['nonexistent'], filesystem)
      expect(result.success).toBe(false)
      expect(result.error).toContain('cannot access')
    })
  })

  describe('pwd command', () => {
    it('should return current directory path', () => {
      const result = commands.pwd([], filesystem)
      expect(result.success).toBe(true)
      expect(result.output).toBe('/home/user')
    })

    it('should work from different directories', () => {
      filesystem.currentPath = ['tmp']
      const result = commands.pwd([], filesystem)
      expect(result.success).toBe(true)
      expect(result.output).toBe('/tmp')
    })
  })

  describe('touch command', () => {
    it('should create a new file', () => {
      const result = commands.touch(['newfile.txt'], filesystem)
      expect(result.success).toBe(true)
      
      // Verify file was created
      const lsResult = commands.ls([], filesystem)
      const output = lsResult.output as any[]
      const hasNewFile = output.some(segment => 
        segment.text && segment.text.includes('newfile.txt')
      )
      expect(hasNewFile).toBe(true)
    })

    it('should update modification time of existing file', () => {
      // First create a file
      commands.touch(['testfile.txt'], filesystem)
      
      // Touch it again
      const result = commands.touch(['testfile.txt'], filesystem)
      expect(result.success).toBe(true)
    })

    it('should fail with no arguments', () => {
      const result = commands.touch([], filesystem)
      expect(result.success).toBe(false)
      expect(result.error).toContain('missing file operand')
    })
  })

  describe('cat command', () => {
    it('should display file contents', () => {
      // Change to documents directory first
      filesystem.currentPath = ['home', 'user', 'documents']
      const result = commands.cat(['readme.txt'], filesystem)
      expect(result.success).toBe(true)
      expect(typeof result.output === 'string').toBe(true)
      expect(result.output).toContain('Welcome to the terminal emulator')
    })

    it('should render markdown files with formatting', () => {
      // Change to documents directory first
      filesystem.currentPath = ['home', 'user', 'documents']
      const result = commands.cat(['example.md'], filesystem)
      expect(result.success).toBe(true)
      expect(Array.isArray(result.output)).toBe(true)
    })

    it('should fail for non-existent file', () => {
      const result = commands.cat(['nonexistent.txt'], filesystem)
      expect(result.success).toBe(false)
      expect(result.error).toContain('No such file or directory')
    })

    it('should fail when trying to cat a directory', () => {
      const result = commands.cat(['documents'], filesystem)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Is a directory')
    })
  })

  describe('mkdir command', () => {
    it('should create a new directory', () => {
      const result = commands.mkdir(['newdir'], filesystem)
      expect(result.success).toBe(true)
      
      // Verify directory was created
      const lsResult = commands.ls([], filesystem)
      const output = lsResult.output as any[]
      const hasNewDir = output.some(segment => 
        segment.text && segment.text.includes('newdir')
      )
      expect(hasNewDir).toBe(true)
    })

    it('should create parent directories with -p flag', () => {
      const result = commands.mkdir(['-p', 'deep/nested/directory'], filesystem)
      expect(result.success).toBe(true)
      
      // Verify nested directory structure was created
      const cdResult = commands.cd(['deep/nested/directory'], filesystem)
      expect(cdResult.success).toBe(true)
    })

    it('should fail when directory already exists without -p', () => {
      commands.mkdir(['testdir'], filesystem)
      const result = commands.mkdir(['testdir'], filesystem)
      expect(result.success).toBe(false)
      expect(result.error).toContain('File exists')
    })

    it('should succeed when directory exists with -p', () => {
      commands.mkdir(['testdir'], filesystem)
      const result = commands.mkdir(['-p', 'testdir'], filesystem)
      expect(result.success).toBe(true)
    })
  })

  describe('rm command', () => {
    it('should remove a file', () => {
      // First create a file
      commands.touch(['tempfile.txt'], filesystem)
      
      const result = commands.rm(['tempfile.txt'], filesystem)
      expect(result.success).toBe(true)
      
      // Verify file was removed
      const catResult = commands.cat(['tempfile.txt'], filesystem)
      expect(catResult.success).toBe(false)
    })

    it('should remove directory with -r flag', () => {
      // Create directory and file
      commands.mkdir(['tempdir'], filesystem)
      
      const result = commands.rm(['-r', 'tempdir'], filesystem)
      expect(result.success).toBe(true)
    })

    it('should force remove with -f flag', () => {
      const result = commands.rm(['-f', 'nonexistent.txt'], filesystem)
      expect(result.success).toBe(true) // Force mode should succeed even for non-existent files
    })

    it('should fail to remove directory without -r', () => {
      commands.mkdir(['tempdir'], filesystem)
      const result = commands.rm(['tempdir'], filesystem)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Is a directory')
    })
  })

  describe('echo command', () => {
    it('should output text', () => {
      const result = commands.echo(['hello', 'world'], filesystem)
      expect(result.success).toBe(true)
      expect(result.output).toBe('hello world')
    })

    it('should handle empty arguments', () => {
      const result = commands.echo([], filesystem)
      expect(result.success).toBe(true)
      expect(result.output).toBe('')
    })
  })

  describe('wc command', () => {
    it('should count lines, words, and characters', () => {
      // Change to documents directory first
      filesystem.currentPath = ['home', 'user', 'documents']
      const result = commands.wc(['readme.txt'], filesystem)
      expect(result.success).toBe(true)
      expect(typeof result.output === 'string').toBe(true)
      expect(result.output).toMatch(/\d+\s+\d+\s+\d+\s+readme.txt/)
    })

    it('should handle multiple files', () => {
      // Change to documents directory first
      filesystem.currentPath = ['home', 'user', 'documents']
      const result = commands.wc(['readme.txt', 'example.md'], filesystem)
      expect(result.success).toBe(true)
      expect(result.output).toContain('total')
    })

    it('should fail for non-existent file', () => {
      const result = commands.wc(['nonexistent.txt'], filesystem)
      expect(result.success).toBe(false)
      expect(result.error).toContain('No such file or directory')
    })
  })

  describe('clear command', () => {
    it('should return CLEAR signal', () => {
      const result = commands.clear([], filesystem)
      expect(result.success).toBe(true)
      expect(result.output).toBe('CLEAR')
    })
  })

  describe('help command', () => {
    it('should display help information', () => {
      const result = commands.help([], filesystem)
      expect(result.success).toBe(true)
      expect(typeof result.output === 'string').toBe(true)
      expect(result.output).toContain('Available commands')
      expect(result.output).toContain('Redirection')
    })
  })
})