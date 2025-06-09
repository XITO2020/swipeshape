import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// This is a test page to verify that the API endpoints are working correctly
const TestPage: React.FC = () => {
  const [apiResults, setApiResults] = useState<{
    programs: any[];
    events: any[];
    apiStatus: string;
  }>({
    programs: [],
    events: [],
    apiStatus: 'Loading...'
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const testApis = async () => {
      setIsLoading(true);
      try {
        const results = {
          programs: [],
          events: [],
          apiStatus: 'All API endpoints working correctly!'
        };

        // Test the programs API endpoint
        try {
          const programsResponse = await fetch('/api/programs');
          results.programs = await programsResponse.json();
          console.log('Programs API response:', results.programs);
        } catch (error) {
          console.error('Programs API error:', error);
          results.apiStatus = 'Programs API error';
        }

        // Test the events API endpoint
        try {
          const eventsResponse = await fetch('/api/events');
          results.events = await eventsResponse.json();
          console.log('Events API response:', results.events);
        } catch (error) {
          console.error('Events API error:', error);
          results.apiStatus = 'Events API error';
        }

        setApiResults(results);
      } catch (error) {
        console.error('Error testing APIs:', error);
        setApiResults({
          programs: [],
          events: [],
          apiStatus: 'Error testing APIs'
        });
      } finally {
        setIsLoading(false);
      }
    };

    testApis();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">API Test Page</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">API Status</h2>
            <div className={`text-lg ${apiResults.apiStatus.includes('error') ? 'text-red-600' : 'text-green-600'}`}>
              {apiResults.apiStatus}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Programs API Test</h2>
            {apiResults.programs.length > 0 ? (
              <div>
                <p className="text-green-600 mb-4">Successfully loaded {apiResults.programs.length} programs!</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiResults.programs.map(program => (
                        <tr key={program.id}>
                          <td className="py-2 px-4 border-b">{program.id}</td>
                          <td className="py-2 px-4 border-b">{program.name}</td>
                          <td className="py-2 px-4 border-b">{program.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-amber-600">No programs found. The API returned an empty array.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Events API Test</h2>
            {apiResults.events.length > 0 ? (
              <div>
                <p className="text-green-600 mb-4">Successfully loaded {apiResults.events.length} events!</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Title</th>
                        <th className="py-2 px-4 border-b">Date</th>
                        <th className="py-2 px-4 border-b">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiResults.events.map(event => (
                        <tr key={event.id}>
                          <td className="py-2 px-4 border-b">{event.id}</td>
                          <td className="py-2 px-4 border-b">{event.title}</td>
                          <td className="py-2 px-4 border-b">{new Date(event.date || event.event_date).toLocaleDateString()}</td>
                          <td className="py-2 px-4 border-b">{event.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-amber-600">No events found. The API returned an empty array.</p>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">API Endpoint URLs</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Programs API: <code className="bg-gray-100 px-2 py-1 rounded">/api/programs</code></li>
              <li>Events API: <code className="bg-gray-100 px-2 py-1 rounded">/api/events</code></li>
              <li>Auth API: <code className="bg-gray-100 px-2 py-1 rounded">/api/auth</code></li>
              <li>Newsletter API: <code className="bg-gray-100 px-2 py-1 rounded">/api/newsletter</code></li>
              <li>Purchase API: <code className="bg-gray-100 px-2 py-1 rounded">/api/purchase</code></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;
