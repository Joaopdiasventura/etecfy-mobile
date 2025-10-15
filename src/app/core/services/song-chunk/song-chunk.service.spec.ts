import { TestBed } from '@angular/core/testing';

import { SongChunkService } from './song-chunk.service';

describe('SongChunkService', () => {
  let service: SongChunkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SongChunkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
