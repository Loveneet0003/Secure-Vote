import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { electionService } from '@/services/electionService';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Server, RefreshCw } from 'lucide-react';

export const ApiTest = () => {
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    time?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [endpointTests, setEndpointTests] = useState<Record<string, boolean | null>>({
    health: null,
    candidates: null,
    election: null,
    settings: null
  });

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

  const testEndpoint = async (endpoint: string) => {
    try {
      const baseUrl = import.meta.env.VITE_RENDER_API_URL || 'http://localhost:3001';
      const url = `${baseUrl}/api/${endpoint}`;
      console.log(`Testing endpoint: ${url}`);
      
      const response = await fetch(url);
      const success = response.ok;
      
      console.log(`Endpoint ${endpoint} test:`, success ? 'Success' : 'Failed', response.status);
      setEndpointTests(prev => ({ ...prev, [endpoint]: success }));
      
      return success;
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error);
      setEndpointTests(prev => ({ ...prev, [endpoint]: false }));
      return false;
    }
  };

  const runEndpointTests = async () => {
    setEndpointTests({
      health: null,
      candidates: null,
      election: null,
      settings: null
    });
    
    const results = await Promise.all([
      testEndpoint('health'),
      testEndpoint('candidates'),
      testEndpoint('election'),
      testEndpoint('settings')
    ]);
    
    const allPassed = results.every(r => r);
    
    if (allPassed) {
      toast.success("All API endpoints are accessible!");
    } else {
      toast.error("Some API endpoints failed. Check console for details.");
    }
  };

  return (
    <Card className="max-w-md mx-auto my-4 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Server className="h-5 w-5" />
          API Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              API URL: {import.meta.env.VITE_RENDER_API_URL || 'Not set'}
            </span>
            <div className="flex gap-2">
              <Button 
                onClick={runEndpointTests} 
                variant="outline"
                size="sm"
              >
                Test Endpoints
              </Button>
              <Button 
                onClick={handleTestConnection} 
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
          </div>

          {/* Endpoint Tests Results */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(endpointTests).map(([endpoint, status]) => (
              <div 
                key={endpoint} 
                className={`p-2 border rounded flex items-center justify-between ${
                  status === null 
                    ? 'bg-gray-100 dark:bg-gray-800' 
                    : status 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <span>
                  /api/{endpoint}
                </span>
                <span>
                  {status === null ? (
                    <RefreshCw className="h-3 w-3 text-gray-400" />
                  ) : status ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                </span>
              </div>
            ))}
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
            <p>Seeing 404 errors?</p>
            <ul className="list-disc list-inside mt-2">
              <li>Make sure your API is running and accessible</li>
              <li>Check if VITE_RENDER_API_URL is set correctly without "/api" at the end</li>
              <li>Verify your server has the correct endpoints configured</li>
              <li>Try opening the API URL directly in your browser</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTest; 