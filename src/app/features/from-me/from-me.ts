import { Component, OnInit, signal } from '@angular/core';

import { RouterLink } from '@angular/router';

import { VelaContentService } from '../../core/services/vela-content.service';

import { FromMeNote } from '../../core/models/from-me.model';


@Component({
  selector: 'app-from-me',
  imports: [RouterLink],
  templateUrl: './from-me.html',
  styleUrl: './from-me.css',
})
export class FromMe implements OnInit {

  private notes: FromMeNote[] = [];


  currentNote = signal<FromMeNote | null>(null);


  showNote = signal(false);


  availableToday = signal(true);


  readonly alreadyReadMessage = signal(false);



  constructor(
    private velaContent: VelaContentService
  ) {}



  ngOnInit(): void {

    this.velaContent
      .getFromMe()
      .subscribe((notes) => {

        this.notes = notes;

        this.checkIfAlreadyRead();

      });

  }



  readNote(): void {

    if (!this.availableToday()) {
      return;
    }


    const history =
      this.getReadHistory();


    const availableNotes =
      this.notes.filter(
        note =>
          !history.includes(note.id)
      );


    if (availableNotes.length === 0) {

      localStorage.removeItem(
        'vela-from-me-history'
      );

      this.readNote();

      return;

    }


    // Selección aleatoria de una nota disponible
    const selected =
      availableNotes[
        Math.floor(
          Math.random() *
          availableNotes.length
        )
      ];


    this.currentNote.set(selected);


    this.showNote.set(true);


    this.saveRead(selected.id);

  }



  private checkIfAlreadyRead(): void {

    const lastDate =
      localStorage.getItem(
        'vela-from-me-date'
      );


    const today =
      new Date()
        .toISOString()
        .split('T')[0];


    if (lastDate === today) {

      this.availableToday.set(false);

      this.alreadyReadMessage.set(true);

    }

  }



  private getReadHistory(): number[] {

    const stored =
      localStorage.getItem(
        'vela-from-me-history'
      );


    return stored
      ? JSON.parse(stored)
      : [];

  }



  private saveRead(
    id: number
  ): void {

    const history =
      this.getReadHistory();


    history.push(id);


    localStorage.setItem(
      'vela-from-me-history',
      JSON.stringify(history)
    );


    localStorage.setItem(
      'vela-from-me-date',
      new Date()
        .toISOString()
        .split('T')[0]
    );


    this.availableToday.set(false);

  }

}