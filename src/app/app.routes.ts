import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Flags } from './flags/flags';
import { Capitals } from './capitals/capitals';
import { Maps } from './maps/maps';

export const routes: Routes = [
  { path: '', component: Landing, title: 'GeoMasters'},
  { path: 'flags', component: Flags},
  { path: 'capitals', component: Capitals},
  { path: 'map', component: Maps},
];
