import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import multipart, { MultipartFile } from '@fastify/multipart';

export default fp(async function (fastify: FastifyInstance) {
  fastify.register(multipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 1000000,
      fields: 10,
      fileSize: 5 * 1024 * 1024,
      files: 1,
      headerPairs: 2000,
    },
    attachFieldsToBody: 'keyValues',
    onFile: async (part: MultipartFile) => {
      const buff = await part.toBuffer();
      (part as any).value = buff.toString('base64')
    }
  });
});
