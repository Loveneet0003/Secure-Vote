import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { electionService } from '@/services/electionService';
import { toast } from 'sonner';

export const ApiTest = () => {
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    time?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult({ time: new Date().toLocaleTimeString() });

    try {
      const result = await electionService.testConnection();
      
      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Connection successful!' 
          : `Failed: ${result.error || 'Unknown error'}`,
        time: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Test failed with error:', error);
      setTestResult({
        success: false,
        message: `Error: ${error.message}`,
        time: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto my-4 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">API Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              API URL: {import.meta.env.VITE_RENDER_API_URL || 'Not set'}
            </span>
            <Button 
              onClick={handleTestConnection} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {testResult.time && (
            <div className={`mt-4 p-3 rounded text-sm ${
              testResult.success 
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              <div className="font-medium">{testResult.success ? 'Success' : 'Failed'}</div>
              <div>{testResult.message}</div>
              <div className="text-xs mt-1 opacity-70">Tested at {testResult.time}</div>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-4">
            <p>Seeing connection issues?</p>
            <ul className="list-disc list-inside mt-2">
              <li>Check if your API server is running</li>
              <li>Verify the VITE_RENDER_API_URL in your .env file</li>
              <li>Make sure your API endpoints include /api in their path</li>
              <li>Check browser console for CORS errors</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTest; 