import { expect, test } from 'claude-code/testing'

const start = { cwd: '/work', surface: 'terminal', isInteractive: true } as const

// The inactive case: the mod registers no command and runs no gh.
const inactive = (name: string, workflow: string | null) =>
  test(name, ($, on) => {
    const registered: string[] = []
    const ran: string[][] = []
    on('session.start', (_$, e) => ({ cwd: e.cwd }))
    on('command.register', (_$, e) => {
      registered.push(e.name)

      return { value: undefined }
    })
    on('process.run', (_$, e) => {
      ran.push([...e.argv])

      return { value: { exitCode: 0, stdout: '[]', stderr: '' } }
    })
    on('fs.read', () => {
      if (workflow === null) throw new Error('ENOENT')

      return { value: workflow }
    })

    return $.session.start(start).then(() => {
      expect(registered).toEqual([])
      expect(ran).toEqual([])
    })
  })

inactive('no docs/workflow.md: no command, no gh', null)
inactive('docs/workflow.md without the contract heading: no command, no gh', '# Notes\n\nNot loopkit.\n')

test('a loopkit project: /loopkit-status is registered immediate', ($, on) => {
  const registered: { name: string; immediate?: true }[] = []
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('command.register', (_$, e) => {
    registered.push({ name: e.name, immediate: e.immediate })

    return { value: undefined }
  })
  on('fs.read', () => ({ value: '# Workflow contract\n\n> Operational contract.\n' }))

  return $.session.start(start).then(() => {
    expect(registered).toEqual([{ name: 'loopkit-status', immediate: true }])
  })
})
