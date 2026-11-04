// Imported first in main.ts: modules run in import order, so this starts before the app's own code
// is even evaluated, and a version that fails there can still be replaced by a fixed one.
import { startUpdates } from './lib/updates'

startUpdates()
