import { prisma } from './prisma';

export const logEvent = async ({
  userId,
  type,
  details,
}: {
  userId: string;
  type: 'purchase' | 'view' | 'download';
  details?: string;
}) => {
  await prisma.event.create({
    data: {
      userId,
      type,
      details,
    },
  });
};
