import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface TableDetails {
  tableName: string;
  rowCount: number;
  columns: {
    name: string;
    type: string;
  }[];
}

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing connection...');
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableDetails, setTableDetails] = useState<TableDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dbUrl, setDbUrl] = useState<string>('');
  const [dbKey, setDbKey] = useState<string>('');

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Check if we can connect
        console.log('Testing Supabase connection...');
        // We can't access protected properties directly, but we can show what we know
        setDbUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || 'Using URL from .env.local');
        // Don't expose the full key for security
        const keyHint = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 8)}...` 
          : 'Using key from .env.local';
        setDbKey(keyHint);
        
        // Test 2: Try to fetch tables
        const { data: tablesData, error: tablesError } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public')
          .limit(20);
        
        if (tablesError) {
          console.error('Supabase tables query error:', tablesError);
          // Try another approach to list tables
          const { data: introspectionData, error: introspectionError } = await supabase
            .rpc('get_tables');
          
          if (introspectionError) {
            console.error('Failed to get tables through RPC:', introspectionError);
            setConnectionStatus('Connection established but could not list tables');
            setError(`Table query error: ${tablesError.message}`);
          } else if (introspectionData) {
            setConnectionStatus('Connection successful!');
            setTables(introspectionData);
          }
        } else if (tablesData && tablesData.length > 0) {
          setConnectionStatus('Connection successful!');
          setTables(tablesData.map(row => row.tablename));
        } else {
          // Attempt direct test query on known tables
          try {
            // Try querying programs table
            const { data: programsTest, error: programsError } = await supabase
              .from('programs')
              .select('count')
              .limit(1);
            
            if (!programsError) {
              setConnectionStatus('Connection successful! Found "programs" table');
              setTables(['programs']);
            } else {
              // Try articles table
              const { data: articlesTest, error: articlesError } = await supabase
                .from('articles')
                .select('count')
                .limit(1);
              
              if (!articlesError) {
                setConnectionStatus('Connection successful! Found "articles" table');
                setTables(['articles']);
              } else {
                setConnectionStatus('Connected but no tables found or accessible');
              }
            }
          } catch (testError) {
            setConnectionStatus('Connected but no tables found or accessible');
            console.error('Error testing specific tables:', testError);
          }
        }
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
        setConnectionStatus('Connection error');
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    testConnection();
  }, []);

  const fetchTableDetails = async (tableName: string) => {
    setSelectedTable(tableName);
    setTableDetails(null);
    setError(null);
    
    try {
      // Get column information
      const { data: columnsData, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: tableName });
      
      if (columnsError) {
        console.error(`Error fetching columns for ${tableName}:`, columnsError);
        setError(`Failed to fetch columns: ${columnsError.message}`);
        return;
      }
      
      // Try to get row count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error(`Error counting rows in ${tableName}:`, countError);
      }
      
      // If we can't get columns through RPC, try a direct select
      let columns = columnsData || [];
      if (!columns.length) {
        // Fallback: Try to get a single row to infer columns
        const { data: sampleRow, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (!sampleError && sampleRow && sampleRow.length > 0) {
          columns = Object.keys(sampleRow[0]).map(key => ({
            column_name: key,
            data_type: typeof sampleRow[0][key]
          }));
        }
      }
      
      // Define an interface for column structure
      interface ColumnData {
        column_name: string;
        data_type: string;
      }
      
      setTableDetails({
        tableName,
        rowCount: count || 0,
        columns: columns.map((col: ColumnData) => ({
          name: col.column_name,
          type: col.data_type
        }))
      });
      
    } catch (err) {
      console.error('Error fetching table details:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="mb-4 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
        <div className={`font-bold ${connectionStatus.includes('successful') ? 'text-green-600' : connectionStatus === 'Testing connection...' ? 'text-blue-600' : 'text-red-600'}`}>
          {connectionStatus}
        </div>
        
        <div className="mt-3">
          <div><strong>Database URL:</strong> {dbUrl}</div>
          <div><strong>API Key:</strong> {dbKey}</div>
        </div>
        
        {error && (
          <div className="mt-2 text-red-600 bg-red-50 p-2 rounded">
            <h3 className="font-semibold">Error:</h3>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {tables.length > 0 && (
          <div className="p-4 border rounded flex-1">
            <h2 className="text-xl font-semibold mb-2">Available Tables</h2>
            <div className="divide-y">
              {tables.map((table) => (
                <div 
                  key={table} 
                  className={`py-2 cursor-pointer ${selectedTable === table ? 'text-blue-600 font-semibold' : ''}`}
                  onClick={() => fetchTableDetails(table)}
                >
                  {table}
                </div>
              ))}
            </div>
          </div>
        )}

        {tableDetails && (
          <div className="p-4 border rounded flex-1">
            <h2 className="text-xl font-semibold mb-2">{tableDetails.tableName}</h2>
            <div className="text-sm mb-2">Total rows: {tableDetails.rowCount}</div>
            
            <h3 className="font-semibold mt-4 mb-2">Columns:</h3>
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                {tableDetails.columns.map((column, index) => (
                  <tr key={index} className="even:bg-gray-50">
                    <td className="border p-2">{column.name}</td>
                    <td className="border p-2">{column.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Common Issues</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Tables might not exist in this database - check that you've created <code>programs</code>, <code>articles</code>, and <code>events</code> tables</li>
          <li>You might have different table names than what the code expects</li>
          <li>RLS (Row Level Security) policies might be preventing access to tables</li>
          <li>The API key might not have the necessary permissions</li>
        </ul>
      </div>
    </div>
  );
};

export default SupabaseTest;
