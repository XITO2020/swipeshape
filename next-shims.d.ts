// next-shims.d.ts
// Permet à TS de reconnaître les imports next/* même sans types officiels

declare module 'next/server';
declare module 'next/router';
declare module 'next/headers';
declare module 'next/link';
declare module 'next/head';
declare module 'next/dynamic';
declare module 'next/navigation';
