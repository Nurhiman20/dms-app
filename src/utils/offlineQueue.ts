/**
 * Offline Queue System
 * Manages queued operations that need to be synced when back online
 */

import { db } from './db';
import { isOnline, checkNetworkStatus } from './networkStatus';

export interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'sale' | 'outlet' | 'dashboard';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineQueueService {
  private isProcessing = false;
  private listeners: Array<(count: number) => void> = [];

  /**
   * Add operation to queue
   */
  async enqueue(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    try {
      // Store in IndexedDB for persistence
      await db.offlineQueue.put(queuedOp);
      this.notifyListeners();
      console.log('[OfflineQueue] Operation queued:', queuedOp.id);

      // Try to process immediately if online
      const online = await checkNetworkStatus();
      if (online) {
        this.processQueue();
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to queue operation:', error);
      throw error;
    }
  }

  /**
   * Get all pending operations
   */
  async getPendingOperations(): Promise<QueuedOperation[]> {
    try {
      return await db.offlineQueue.toArray();
    } catch {
      return [];
    }
  }

  /**
   * Get pending operations count
   */
  async getPendingCount(): Promise<number> {
    try {
      return await db.offlineQueue.count();
    } catch {
      return 0;
    }
  }

  /**
   * Process queued operations when online
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    const online = await checkNetworkStatus();
    if (!online) {
      console.log('[OfflineQueue] Skipping queue processing - offline');
      return;
    }

    this.isProcessing = true;

    try {
      const operations = await this.getPendingOperations();
      if (operations.length === 0) {
        this.isProcessing = false;
        return;
      }

      console.log(`[OfflineQueue] Processing ${operations.length} operations`);
      let successCount = 0;
      let failCount = 0;

      for (const operation of operations) {
        try {
          // Execute the operation based on type
          await this.executeOperation(operation);

          // Remove from queue on success
          await db.offlineQueue.delete(operation.id);
          successCount++;
          console.log(`[OfflineQueue] Operation ${operation.id} processed successfully`);
        } catch (error) {
          // Increment retry count
          operation.retryCount++;

          // Remove if retried too many times
          if (operation.retryCount >= 3) {
            console.error(`[OfflineQueue] Operation ${operation.id} failed after ${operation.retryCount} retries`);
            await db.offlineQueue.delete(operation.id);
            failCount++;
          } else {
            // Update retry count
            await db.offlineQueue.put(operation);
          }
        }
      }

      // Show notification if we processed operations
      if (successCount > 0 || failCount > 0) {
        this.showSyncNotification(successCount, failCount);
      }

      this.notifyListeners();
    } catch (error) {
      console.error('[OfflineQueue] Error processing queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Show notification about sync results
   */
  private showSyncNotification(successCount: number, failCount: number): void {
    // Use dynamic import to avoid circular dependencies
    import('quasar').then(({ Notify }) => {
      if (successCount > 0 && failCount === 0) {
        Notify.create({
          type: 'positive',
          message: `Successfully synced ${successCount} operation${successCount > 1 ? 's' : ''}`,
          position: 'top',
          timeout: 3000,
        });
      } else if (successCount > 0 && failCount > 0) {
        Notify.create({
          type: 'warning',
          message: `Synced ${successCount} operation${successCount > 1 ? 's' : ''}, ${failCount} failed`,
          position: 'top',
          timeout: 4000,
        });
      } else if (failCount > 0) {
        Notify.create({
          type: 'negative',
          message: `Failed to sync ${failCount} operation${failCount > 1 ? 's' : ''}`,
          position: 'top',
          timeout: 4000,
        });
      }
    }).catch(() => {
      // Quasar not available, just log
      console.log(`[OfflineQueue] Synced ${successCount}, failed ${failCount}`);
    });
  }

  /**
   * Execute a queued operation
   * This is a placeholder - implement actual sync logic based on your API
   */
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    // TODO: Implement actual API sync logic
    // For now, just log the operation
    console.log('[OfflineQueue] Executing operation:', operation);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    // In a real implementation, you would:
    // - Call the appropriate API endpoint based on operation.type and operation.entity
    // - Handle the response
    // - Update local store if needed
  }

  /**
   * Clear all queued operations
   */
  async clear(): Promise<void> {
    try {
      await db.offlineQueue.clear();
      this.notifyListeners();
    } catch (error) {
      console.error('[OfflineQueue] Failed to clear queue:', error);
    }
  }

  /**
   * Subscribe to queue count changes
   */
  subscribe(listener: (count: number) => void): () => void {
    this.listeners.push(listener);

    // Initial notification
    this.getPendingCount().then(count => listener(count));

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private async notifyListeners(): Promise<void> {
    const count = await this.getPendingCount();
    this.listeners.forEach(listener => listener(count));
  }

  /**
   * Setup automatic queue processing when coming back online
   */
  setupAutoSync(): void {
    // Listen for online event
    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Network online - processing queue');
      this.processQueue();
    });
  }
}

export const offlineQueue = new OfflineQueueService();

// Setup auto-sync on module load
if (typeof window !== 'undefined') {
  offlineQueue.setupAutoSync();
}

