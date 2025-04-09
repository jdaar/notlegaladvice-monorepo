import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.route({
    url: '/',
    method: 'GET',
    handler: async (_) => {
      return { success: true }
    }
  });
}
