'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { taskService } from '@/lib/storage';

export default function TestTaskUpdatePage() {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    let output = '';

    try {
      output += '=== Task Update Test ===\n\n';

      // Create a test task
      const testTask = await taskService.create({
        userId: 'test-user-' + Date.now(),
        title: 'Test Task for Date Update',
        description: 'Testing date modification',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2025-01-15').toISOString(),
        sectionId: 'today'
      } as any);

      output += '✅ Created test task:\n';
      output += JSON.stringify({
        id: testTask.id,
        title: testTask.title,
        dueDate: testTask.dueDate,
        sectionId: testTask.sectionId
      }, null, 2) + '\n\n';

      // Update the task date
      const newDate = new Date('2025-01-20');
      output += '🔄 Updating task date to: ' + newDate.toISOString() + '\n\n';

      const updatedTask = await taskService.update(testTask.id, {
        dueDate: newDate.toISOString()
      });

      if (updatedTask) {
        output += '✅ Task updated successfully:\n';
        output += JSON.stringify({
          id: updatedTask.id,
          title: updatedTask.title,
          dueDate: updatedTask.dueDate,
          updatedAt: updatedTask.updatedAt,
          device_id: updatedTask.device_id
        }, null, 2) + '\n\n';
      } else {
        output += '❌ Failed to update task - returned null\n\n';
      }

      // Verify the update
      const verifiedTask = await taskService.getById(testTask.id);
      if (verifiedTask && verifiedTask.dueDate === newDate.toISOString()) {
        output += '✅ Verification successful: Date was properly updated\n\n';
      } else {
        output += '❌ Verification failed: Date was not properly updated\n\n';
      }

      // Check localStorage directly
      const tasksData = localStorage.getItem('tasks');
      if (tasksData) {
        const tasks = JSON.parse(tasksData);
        const storedTask = tasks.find((t: any) => t.id === testTask.id);
        if (storedTask) {
          output += '📦 Task in localStorage:\n';
          output += JSON.stringify(storedTask, null, 2) + '\n\n';
        }
      }

      // Clean up
      await taskService.delete(testTask.id);
      output += '🧹 Test task cleaned up\n';

    } catch (error) {
      output += '❌ Test failed with error: ' + (error as Error).message + '\n';
      output += 'Stack: ' + (error as Error).stack;
    } finally {
      setResults(output);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Task Update Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runTest} disabled={loading}>
            {loading ? 'Running Test...' : 'Run Task Update Test'}
          </Button>

          {results && (
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-x-auto text-sm">
              {results}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}