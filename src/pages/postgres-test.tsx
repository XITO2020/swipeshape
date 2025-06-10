import React, { useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import styles from '@/styles/Home.module.css';

interface PostgresTestProps {
  initialData: {
    connectionStatus: { success: boolean; time?: string; error?: any } | null;
    tables: string[];
    error: string | null;
  };
}

type TableRow = Record<string, any>;

export default function PostgresTest({ initialData }: PostgresTestProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableRow[] | null>(null);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialData.error);

  // We get this data from the server now
  const connectionStatus = initialData.connectionStatus;
  const tables = initialData.tables;

  // Instead of fetching on the client, we'll fetch data via API routes
  const fetchTableData = async (tableName: string) => {
    try {
      setIsLoading(true);
      setSelectedTable(tableName);
      setTableData(null);
      setTableColumns([]);
      
      // Call API endpoint instead of direct database query
      const response = await fetch(`/api/database/table-data?table=${encodeURIComponent(tableName)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch table data');
      }
      
      const data = await response.json();
      
      setTableColumns(data.columns || []);
      setTableData(data.rows || []);
    } catch (err: any) {
      setError(`Failed to fetch data from ${tableName}: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>PostgreSQL Test</title>
        <meta name="description" content="Test PostgreSQL Connection" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>PostgreSQL Connection Test</h1>
        
        {/* Connection status */}
        {connectionStatus ? (
          <div className={connectionStatus.success ? styles.success : styles.error}>
            {connectionStatus.success 
              ? `✅ Connected successfully in ${connectionStatus.time}ms` 
              : `❌ Connection failed: ${connectionStatus.error}`}
          </div>
        ) : (
          <p>Testing connection...</p>
        )}
        
        {/* Error display */}
        {error && <div className={styles.error}>{error}</div>}
        
        {/* Display tables list if connection succeeded */}
        {connectionStatus?.success && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <h2>Database Tables</h2>
              {isLoading ? (
                <p>Loading...</p>
              ) : tables.length > 0 ? (
                <ul className={styles.list}>
                  {tables.map((table) => (
                    <li key={table}>
                      <button onClick={() => fetchTableData(table)}>
                        {table} {selectedTable === table && '(selected)'}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tables found</p>
              )}
            </div>
            
            {/* Display table data if a table is selected */}
            {selectedTable && (
              <div className={styles.cardWide}>
                <h2>Table: {selectedTable}</h2>
                {isLoading ? (
                  <p>Loading data...</p>
                ) : tableData ? (
                  <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          {tableColumns.map((column: string) => (
                            <th key={column}>{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row: TableRow, i: number) => (
                          <tr key={i}>
                            {tableColumns.map((column: string) => (
                              <td key={column}>
                                {row[column] !== null ? String(row[column]) : 'NULL'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No data available</p>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className={styles.card} style={{ marginTop: '2rem' }}>
          <h2>Troubleshooting Tips</h2>
          <ul>
            <li>Make sure you've added the correct database credentials to your <code>.env.local</code> file</li>
            <li>Verify that your IP address is allowed in database settings</li>
            <li>Check if RLS (Row Level Security) policies are preventing access</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Move database operations to the server side
  try {
    // Import server-side only
    const { query, testConnection } = require('@/lib/pgClient');
    
    // Test connection
    const connectionStatus = await testConnection();
    
    // Get tables if connection successful
    let tables: string[] = [];
    let error = null;
    
    if (connectionStatus.success) {
      try {
        const result = await query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name ASC;
        `);
        
        if (result.rows) {
          tables = result.rows.map((row: any) => row.table_name);
        }
      } catch (err: any) {
        error = 'Failed to fetch tables: ' + err.message;
      }
    }
    
    return {
      props: {
        initialData: {
          connectionStatus,
          tables,
          error
        }
      }
    };
  } catch (err: any) {
    // Return error state if server-side code fails
    return {
      props: {
        initialData: {
          connectionStatus: { success: false, error: err.message },
          tables: [],
          error: 'Server error: ' + err.message
        }
      }
    };
  }
}
