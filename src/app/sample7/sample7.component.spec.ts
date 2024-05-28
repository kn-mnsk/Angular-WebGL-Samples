import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sample7Component } from './sample7.component';

describe('Sample7Component', () => {
  let component: Sample7Component;
  let fixture: ComponentFixture<Sample7Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sample7Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sample7Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
