import { FastifyInstance } from 'fastify';
import { domain } from '@notlegaladvice/domain'

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: domain() };
  });
}
