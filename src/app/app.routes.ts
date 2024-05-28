//Getting started with standalone components => https://angular.io/guide/standalone-components

// Standalone Components Mastery in Angular 17 => https://medium.com/@nehamishra_35291/standalone-components-mastery-in-angular-17-e3893d1a5b04

import { Routes } from '@angular/router';
import { Sample1Component } from './sample1/sample1.component';
import { Sample2Component } from './sample2/sample2.component';
import { Sample3Component } from './sample3/sample3.component';
import { Sample4Component } from './sample4/sample4.component';
import { Sample5Component } from './sample5/sample5.component';
import { Sample6Component } from './sample6/sample6.component';
import { Sample7Component } from './sample7/sample7.component';
import { Sample8Component } from './sample8/sample8.component';

export const routes: Routes = [
  { path: 'sample1', title: 'Sample1', component: Sample1Component },
  { path: 'sample2', title: 'Sample2', component: Sample2Component },
  { path: 'sample3', title: 'Sample3', component: Sample3Component },
  { path: 'sample4', title: 'Sample4', component: Sample4Component },
  { path: 'sample5', title: 'Sample5', component: Sample5Component },
  { path: 'sample6', title: 'Sample6', component: Sample6Component },
  { path: 'sample7', title: 'Sample7', component: Sample7Component },
  { path: 'sample8', title: 'sample8', component: Sample8Component },
  // { path: '', title: 'WebGL Samples', component: AppComponent},
  { path: '', title: 'AngularWebGLSamples', redirectTo: './', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];


