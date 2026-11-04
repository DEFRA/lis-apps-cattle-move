import { afterEach, expect, test, vi } from 'vitest'

afterEach(() => {
  delete process.env.LOG_FORMAT
})

test('server.js maps LOG_FORMAT=pretty onto the logger pretty-print format', async () => {
  // Arrange
  process.env.LOG_FORMAT = 'pretty'
  vi.resetModules()

  // Act
  await import('./server.js')
  const { logger: serverLogger } = await import('@defra/lis-hubs-infra-core')

  // Assert
  expect(serverLogger.format).toBe('pretty-print')
})

test('server.js passes any other LOG_FORMAT value through to the logger unchanged', async () => {
  // Arrange
  process.env.LOG_FORMAT = 'ecs'
  vi.resetModules()

  // Act
  await import('./server.js')
  const { logger: serverLogger } = await import('@defra/lis-hubs-infra-core')

  // Assert
  expect(serverLogger.format).toBe('ecs')
})
