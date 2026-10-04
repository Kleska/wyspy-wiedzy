/*
 * Działy tematów wbudowanych. Plansza przedmiotu pokazuje jeden dział naraz, a rodzic może przenieść cały dział
 * do „skończonych” — dlatego każdy temat wbudowany ma dział (pilnuje tego test). Angielski ma działy w `english5.ts`
 * (rozdziały podręcznika: „Unit 0”…). Zmiana działu nie zmienia identyfikatorów zadań, więc postępy zostają.
 * Kolejność działów na planszy wynika z kolejności tematów (`order`): dział stoi tam, gdzie jego pierwszy temat.
 */
export const UNITS: Record<string, string> = {
  // Klasa 3 — język polski
  'b-rzeczownik': 'Części mowy',
  'b-czasownik': 'Części mowy',
  'b-przymiotnik': 'Części mowy',
  'b-czesci-mowy': 'Części mowy',
  'b-czasy': 'Części mowy',
  'b-osoby': 'Części mowy',
  'b-dyktando-3': 'Ortografia',
  'b-czytanie-3': 'Czytanie',
  // Klasa 3 — matematyka
  'b-m3-dodawanie': 'Dodawanie i odejmowanie',
  'b-mnozenie-6-7': 'Mnożenie i dzielenie',
  'b-m3-mnozenie-8-9': 'Mnożenie i dzielenie',
  'b-m3-dzielenie': 'Mnożenie i dzielenie',
  'b-m3-zadania': 'Zadania z treścią',
  // Klasa 5 — język polski
  'b-p5-przypadki': 'Gramatyka',
  'b-p5-stopniowanie': 'Gramatyka',
  'b-p5-odmienne': 'Gramatyka',
  'b-p5-podmiot': 'Gramatyka',
  'b-p5-o-u': 'Ortografia',
  'b-p5-nie': 'Ortografia',
  'b-p5-dyktando': 'Ortografia',
  'b-p5-czytanie': 'Czytanie',
  // Klasa 5 — matematyka
  'b-m5-dzp-bez': 'Działania pisemne',
  'b-m5-dzp-reszta': 'Działania pisemne',
  'b-m5-ulamki': 'Ułamki zwykłe',
  'b-m5-ulamki-dzialania': 'Ułamki zwykłe',
  'b-m5-dziesietne': 'Ułamki dziesiętne',
  'b-m5-pole-obwod': 'Geometria',
  'b-m5-kolejnosc': 'Liczby i działania',
  'b-m5-podzielnosc': 'Liczby i działania',
};
