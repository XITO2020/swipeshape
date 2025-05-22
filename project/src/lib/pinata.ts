import axios from 'axios';
import FormData from 'form-data';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs/';

// For development, use a fallback gateway if Pinata credentials are missing
const IPFS_PUBLIC_GATEWAY = 'https://ipfs.io/ipfs/';

/**
 * Upload a file to IPFS via Pinata
 * @param file - The file to upload
 * @param name - Optional name for the file
 * @returns The IPFS CID and full gateway URL
 */
export const uploadToPinata = async (file: File, name?: string): Promise<{ cid: string, url: string }> => {
  try {
    // Check if Pinata credentials are available
    if (!PINATA_API_KEY || !PINATA_API_SECRET || !PINATA_JWT) {
      console.warn('Missing Pinata credentials. Using mock upload for development.');
      // Create a mock response for development
      const mockCid = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      // Return the file as a data URL for preview purposes
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      return { cid: mockCid, url: dataUrl };
    }

    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: name || file.name,
      keyvalues: {
        app: 'swipe-shape',
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', options);

    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
        }
      }
    );

    const cid = response.data.IpfsHash;
    const url = `${PINATA_GATEWAY_URL}${cid}`;
    
    return { cid, url };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    
    // For development, create a fallback with data URL
    if (!PINATA_API_KEY || !PINATA_API_SECRET || !PINATA_JWT) {
      const mockCid = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      return { cid: mockCid, url: dataUrl };
    }
    
    throw new Error('Failed to upload file to IPFS');
  }
};

/**
 * Get a list of files pinned to Pinata
 * @returns Array of pinned files with metadata
 */
export const getPinnedFiles = async () => {
  try {
    if (!PINATA_API_KEY || !PINATA_API_SECRET || !PINATA_JWT) {
      console.warn('Missing Pinata credentials. Using mock data for development.');
      return [];
    }
    
    const response = await axios.get(
      `${PINATA_API_URL}/data/pinList?status=pinned&metadata[keyvalues]={"app":{"value":"swipe-shape","op":"eq"}}`,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      }
    );
    
    return response.data.rows;
  } catch (error) {
    console.error('Error fetching pinned files:', error);
    return [];
  }
};

/**
 * Unpin a file from Pinata
 * @param cid - The CID of the file to unpin
 * @returns Success status
 */
export const unpinFile = async (cid: string): Promise<boolean> => {
  try {
    if (!PINATA_API_KEY || !PINATA_API_SECRET || !PINATA_JWT) {
      console.warn('Missing Pinata credentials. Mock unpin for development.');
      return true;
    }
    
    await axios.delete(
      `${PINATA_API_URL}/pinning/unpin/${cid}`,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error unpinning file:', error);
    return false;
  }
};

/**
 * Convert a CID to a full gateway URL
 * @param cid - The IPFS CID or URL
 * @returns The full gateway URL or original URL
 */
export const cidToUrl = (cid: string): string => {
  if (!cid) return '';
  
  // If it's already a full URL (including data URLs), return it
  if (cid.startsWith('http') || cid.startsWith('data:')) {
    return cid;
  }
  
  // If it's a mock CID from development mode, return a placeholder
  if (cid.startsWith('mock-')) {
    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
  }
  
  // If it's a CID with ipfs:// protocol, extract just the CID
  if (cid.startsWith('ipfs://')) {
    cid = cid.replace('ipfs://', '');
  }
  
  // Use Pinata gateway if credentials are available, otherwise use public gateway
  const gateway = (PINATA_API_KEY && PINATA_API_SECRET) ? PINATA_GATEWAY_URL : IPFS_PUBLIC_GATEWAY;
  return `${gateway}${cid}`;
};