import { fileRepository } from './file-repository.js';

describe('fileRepository', () => {
  it('should work', () => {
    expect(fileRepository()).toEqual('file-repository');
  });
});
