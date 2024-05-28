import { TestBed } from '@angular/core/testing';

import { DrawSceneService } from './draw-scene.service';

describe('DrawSceneService', () => {
  let service: DrawSceneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawSceneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
