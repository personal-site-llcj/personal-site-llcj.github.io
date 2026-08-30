import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { ThemeService } from '../services/theme.service';


export const velaAccessGuard: CanActivateFn = () => {

  const themeService = inject(ThemeService);
  const router = inject(Router);


  if (themeService.hasAccess()) {

    return true;

  }


  return router.createUrlTree(['/']);

};