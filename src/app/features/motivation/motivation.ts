import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { VelaContentService } from '../../core/services/vela-content.service';
import { VelaMessage } from '../../core/models/vela-message.model';


@Component({
  selector: 'app-motivation',
  imports: [RouterLink],
  templateUrl: './motivation.html',
  styleUrl: './motivation.css',
})
export class Motivation implements OnInit {

  private messages: VelaMessage[] = [];


  currentMessage = signal<VelaMessage>({
    id: 0,
    text: '',
    personal: false,
  });


  changing = signal(false);


  constructor(
    private velaContent: VelaContentService,
    private route: ActivatedRoute
  ) {}


  ngOnInit(): void {

    this.velaContent
      .getMotivation()
      .subscribe((messages) => {

        this.messages = messages;


        if (messages.length === 0) {
          return;
        }


        const experience =
          this.route.snapshot.queryParamMap.get(
            'experience'
          );


        if (experience === 'random') {

          const randomIndex =
            Math.floor(
              Math.random() * messages.length
            );


          this.currentMessage.set(
            messages[randomIndex]
          );

        } else {

          this.currentMessage.set(
            messages[0]
          );

        }

      });

  }


  showAnotherMessage(): void {

    if (
      this.changing() ||
      this.messages.length < 2
    ) {
      return;
    }


    this.changing.set(true);


    setTimeout(() => {

      let nextMessage =
        this.currentMessage();


      while (
        nextMessage.id === this.currentMessage().id
      ) {

        const randomIndex =
          Math.floor(
            Math.random() * this.messages.length
          );


        nextMessage =
          this.messages[randomIndex];

      }


      this.currentMessage.set(nextMessage);


      setTimeout(() => {

        this.changing.set(false);

      }, 60);


    }, 250);

  }

}