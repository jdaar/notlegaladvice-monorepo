import { FastifyInstance } from 'fastify';
import { domain } from '@notlegaladvice/domain'
import { llmIntegration } from '@notlegaladvice/llm-integration'
import { database } from '@notlegaladvice/database'
import { fileRepository } from '@notlegaladvice/file-repository'

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: domain().concat(llmIntegration()).concat(database()).concat(fileRepository()) };
  });
}
