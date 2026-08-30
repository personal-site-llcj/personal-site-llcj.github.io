export type CompanionCategory =
  | 'arrival'
  | 'permission'
  | 'release'
  | 'company'
  | 'closing';


export interface CompanionPhrase {

  id: number;

  category: CompanionCategory;

  text: string;

}



export type HearCategory =
  | 'self-doubt'
  | 'enough'
  | 'tired'
  | 'pressure'
  | 'mistakes'
  | 'self-demand'
  | 'qualities'
  | 'from-me';



export interface HearMessage {

  id: number;

  category: HearCategory;

  text: string;

}



export interface FromMeMessage {

  id: number;

  text: string;

  opening?: boolean;

  note?: string;

}



export interface AccompaniedContent {

  stay: CompanionPhrase[];

  hear: HearMessage[];

  fromMe: FromMeMessage[];

}