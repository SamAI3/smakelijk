export type Eenheid = 'gram' | 'ml' | 'stuks' | 'el' | 'tl' | 'snuf' | 'kg' | 'liter' | 'pak' | 'blik' | 'teen' | 'takje' | 'blad';

export interface Ingredient {
  hoeveelheid: number;
  eenheid: Eenheid | string;
  naam: string;
}

export type ReceptType = 'hoofdgerecht' | 'overig';
export type Moeilijkheid = 'doordeweeks' | 'weekend';

export interface Recept {
  id: string;
  titel: string;
  type: ReceptType;
  ingredienten: Ingredient[];
  bereiding: string[];
  keuken: string;
  moeilijkheid: Moeilijkheid;
  bereidingstijd: number;
  porties: number;
  tags: string[];
  notities: string;
  bronUrl: string;
  favoriet: boolean;
  aangemaakt: Date;
  laatstGemaakt: Date | null;
  toegevoegdDoor: string;
}

export interface Weekkeuze {
  id: string;
  receptId: string;
  porties: number;
  toegevoegd: Date;
}

export interface Household {
  id: string;
  naam: string;
  code: string;
  leden: string[];
  aangemaakt: Date;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
