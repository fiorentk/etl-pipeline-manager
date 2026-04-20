import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import 'dotenv/config';

function parseDatabaseUrl(url: string) {
  if (!url) return {} as any;
  const [protocolAndHost, rest] = url.split(';database=');
  const [, hostAndPort] = protocolAndHost.split('//');
  const [server, portStr] = hostAndPort ? hostAndPort.split(':') : ['', ''];
  
  const params: Record<string, string> = {};
  if (rest) {
    `database=${rest}`.split(';').forEach(part => {
      const [key, value] = part.split('=');
      if (key && value) {
        params[key] = value;
      }
    });
  }

  return {
    server: server,
    port: portStr ? parseInt(portStr) : 1433,
    user: params.user || '',
    password: params.password || '',
    database: params.database || '',
    options: {
      encrypt: params.encrypt === 'true',
      trustServerCertificate: params.trustServerCertificate === 'true',
    }
  };
}

const dbUrl = process.env.DATABASE_URL || '';
const adapter = new PrismaMssql(parseDatabaseUrl(dbUrl), { schema: 'etl' });
const prisma = new PrismaClient({ adapter });

export default prisma;
