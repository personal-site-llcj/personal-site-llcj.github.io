import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { VelaMessage } from '../models/vela-message.model';
import { AccompaniedContent } from '../models/accompanied.model';
import { FromMeNote } from '../models/from-me.model';


@Injectable({
  providedIn: 'root'
})
export class VelaContentService {


  constructor(
    private http: HttpClient
  ) {}



  getMotivation(): Observable<VelaMessage[]> {

    return this.http.get<VelaMessage[]>(
      'data/motivation.json'
    );

  }



  getAccompanied(): Observable<AccompaniedContent> {

    return this.http.get<AccompaniedContent>(
      'data/accompanied.json'
    );

  }



  getFromMe(): Observable<FromMeNote[]> {

    return this.http.get<FromMeNote[]>(
      'data/from-me.json'
    );

  }


}