'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [result, setResult] = useState<{
    match?: boolean;
    matchPercentage?: number;
    details?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const compareAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compare-addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address1, address2 }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: 'Failed to compare addresses. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Address Comparison Tool
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Compare two addresses and see how similar they are
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Address
              </label>
              <Input
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Enter first address"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Second Address
              </label>
              <Input
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Enter second address"
                className="w-full"
              />
            </div>

            <Button
              onClick={compareAddresses}
              disabled={loading || !address1 || !address2}
              className="w-full"
            >
              {loading ? 'Comparing...' : 'Compare Addresses'}
            </Button>
          </div>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.error 
                ? 'bg-red-50 dark:bg-red-900/20' 
                : 'bg-gray-50 dark:bg-gray-800/50'
            }`}>
              {result.error ? (
                <div className="flex items-center text-red-700 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{result.error}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle2 className={`h-5 w-5 mr-2 ${
                      result.match 
                        ? 'text-green-500' 
                        : 'text-yellow-500'
                    }`} />
                    <span className="font-medium">
                      {result.match ? 'Addresses Match!' : 'Addresses Different'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Match Percentage: {result.matchPercentage}%
                  </div>
                  {result.details && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {result.details}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}