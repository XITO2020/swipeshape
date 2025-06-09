import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { query, testConnection } from '../lib/pgClient';
import styles from '../styles/Home.module.css';

export default function PostgresTest() {
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; time?: string; error?: any } | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[] | null>(null);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test connection on component mount
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const result = await testConnection();
        setConnectionStatus(result);
        
        if (result.success) {
          // If connection successful, fetch table list
          fetchTables();
        }
      } catch (err) {
        setError('Failed to connect to database');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      // Query to get all tables in the public schema
      const result = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      if (result.rows) {
        setTables(result.rows.map(row => row.table_name));
      }
    } catch (err) {
      setError('Failed to fetch tables');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableDetails = async (tableName: string) => {
    try {
      setIsLoading(true);
      setSelectedTable(tableName);
      setTableData(null);
      
      // Get column information
      const columnsResult = await query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      setTableColumns(columnsResult.rows.map(row => 
        `${row.column_name} (${row.data_type})`
      ));
      
      // Get table data (limit to 10 rows)
      const dataResult = await query(`
        SELECT * FROM "${tableName}" LIMIT 10
      `);
      
      setTableData(dataResult.rows);
    } catch (err) {
      setError(`Failed to fetch details for table ${tableName}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>PostgreSQL Connection Test</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>PostgreSQL Connection Test</h1>
        
        <div className={styles.card} style={{ marginTop: '2rem', padding: '1.5rem', width: '100%', maxWidth: '800px' }}>
          <h2>Connection Status</h2>
          {isLoading && <p>Loading...</p>}
          {connectionStatus && (
            connectionStatus.success ? (
              <p style={{ color: 'green' }}>✅ Connected to PostgreSQL database at {connectionStatus.time}</p>
            ) : (
              <p style={{ color: 'red' }}>❌ Connection failed: {connectionStatus.error?.message || 'Unknown error'}</p>
            )
          )}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>

        {connectionStatus?.success && (
          <>
            <div className={styles.card} style={{ marginTop: '1rem', padding: '1.5rem', width: '100%', maxWidth: '800px' }}>
              <h2>Database Tables</h2>
              {tables.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {tables.map(table => (
                    <li key={table} style={{ margin: '0.5rem 0' }}>
                      <button 
                        onClick={() => fetchTableDetails(table)}
                        style={{ 
                          padding: '0.5rem 1rem', 
                          background: selectedTable === table ? '#0070f3' : '#f0f0f0',
                          color: selectedTable === table ? 'white' : 'black',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left'
                        }}
                      >
                        {table}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tables found in public schema</p>
              )}
            </div>

            {selectedTable && (
              <div className={styles.card} style={{ marginTop: '1rem', padding: '1.5rem', width: '100%', maxWidth: '800px' }}>
                <h2>Table: {selectedTable}</h2>
                
                <h3>Columns</h3>
                <ul>
                  {tableColumns.map((column, index) => (
                    <li key={index}>{column}</li>
                  ))}
                </ul>
                
                <h3>Sample Data</h3>
                {tableData && tableData.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead>
                        <tr>
                          {Object.keys(tableData[0]).map(key => (
                            <th key={key} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {Object.values(row).map((value: any, valIndex) => (
                              <td key={valIndex} style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {typeof value === 'object' ? JSON.stringify(value) : String(value || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No data found in table</p>
                )}
              </div>
            )}
          </>
        )}

        <div className={styles.card} style={{ marginTop: '2rem', padding: '1.5rem', width: '100%', maxWidth: '800px' }}>
          <h2>Troubleshooting Tips</h2>
          <ul>
            <li>Make sure you've added the correct database credentials to your <code>.env.local</code> file</li>
            <li>Check that your database password is correct</li>
            <li>Verify that your IP address is allowed in Supabase's database settings</li>
            <li>If tables are missing, you may need to create them</li>
            <li>Check if RLS (Row Level Security) policies are preventing access</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
