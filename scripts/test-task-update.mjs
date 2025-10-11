#!/usr/bin/env node

/**
 * Task Update Test Script
 * Tests if task date modification works correctly after fixes
 */

import { JSDOM } from 'jsdom';

// Set up a mock DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

// Import the necessary modules
const taskModule = await import('../src/lib/storage/services/TaskService.ts');
const storageModule = await import('../src/lib/storage/index.ts');

const { taskService } = storageModule;

async function testTaskUpdate() {
  console.log('=== Testing Task Date Update ===\n');

  try {
    // Create a test task
    const testTask = await taskService.create({
      userId: 'test-user-123',
      title: 'Test Task for Date Update',
      description: 'Testing date modification',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date('2025-01-15').toISOString(),
      sectionId: 'today'
    });

    console.log('✅ Created test task:', {
      id: testTask.id,
      title: testTask.title,
      dueDate: testTask.dueDate,
      sectionId: testTask.sectionId
    });

    // Update the task date (like CalendarWidget does)
    const newDate = new Date('2025-01-20');
    console.log('\n🔄 Updating task date to:', newDate.toISOString());

    const updatedTask = await taskService.update(testTask.id, {
      dueDate: newDate.toISOString()
    });

    if (updatedTask) {
      console.log('✅ Task updated successfully:', {
        id: updatedTask.id,
        title: updatedTask.title,
        dueDate: updatedTask.dueDate,
        updatedAt: updatedTask.updatedAt,
        device_id: updatedTask.device_id
      });
    } else {
      console.error('❌ Failed to update task - returned null');
    }

    // Verify the update by fetching the task again
    const verifiedTask = await taskService.getById(testTask.id);
    if (verifiedTask && verifiedTask.dueDate === newDate.toISOString()) {
      console.log('\n✅ Verification successful: Date was properly updated');
    } else {
      console.error('❌ Verification failed: Date was not properly updated');
    }

    // Clean up test data
    await taskService.delete(testTask.id);
    console.log('\n🧹 Test task cleaned up');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
testTaskUpdate().then(() => {
  console.log('\n=== Test Complete ===');
  process.exit(0);
}).catch(error => {
  console.error('Test script failed:', error);
  process.exit(1);
});