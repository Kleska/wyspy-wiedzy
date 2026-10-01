/*
 * Pomysły na prawdziwe nagrody. Ceny dobrane do tempa zdobywania punktów:
 * dziecko ćwiczące ok. 15–20 minut dziennie zbiera mniej więcej 250–350 punktów tygodniowo.
 */

export interface RewardIdea {
  title: string;
  cost: number;
}

export const REWARD_IDEAS: { group: string; hint: string; items: RewardIdea[] }[] = [
  {
    group: 'Czas z rodzicem',
    hint: 'Najlepiej działają — dziecko dostaje uwagę, a nie rzecz.',
    items: [
      { title: 'Gra planszowa z rodzicem — wybieram grę', cost: 150 },
      { title: 'Wspólny wieczór budowania z klocków', cost: 200 },
      { title: 'Wspólne pieczenie ciasta albo pizzy', cost: 300 },
      { title: 'Wycieczka rowerowa albo na rolki z rodzicem', cost: 400 },
    ],
  },
  {
    group: 'Przywileje',
    hint: 'Nic nie kosztują, a dzieci bardzo je lubią.',
    items: [
      { title: 'Wybieram muzykę w samochodzie przez cały dzień', cost: 100 },
      { title: 'Wybieram obiad na jutro', cost: 200 },
      { title: 'Pójście spać 30 minut później (w piątek lub sobotę)', cost: 250 },
      { title: 'Dzień bez jednego obowiązku domowego', cost: 250 },
    ],
  },
  {
    group: 'Wyjścia i przeżycia',
    hint: 'Większe cele na kilka tygodni — dobrze pasują też jako wspólny cel rodzeństwa.',
    items: [
      { title: 'Wyjście na lody albo gofry', cost: 300 },
      { title: 'Basen albo park trampolin', cost: 800 },
      { title: 'Nocowanie u kolegi lub koleżanki (albo u nas)', cost: 800 },
      { title: 'Kino z rodzicem', cost: 1000 },
      { title: 'Wycieczka do zoo, aquaparku albo centrum nauki', cost: 1500 },
    ],
  },
  {
    group: 'Rzeczy',
    hint: 'Raczej rzadziej i za większe wysiłki.',
    items: [
      { title: 'Naklejki albo mała niespodzianka', cost: 250 },
      { title: 'Nowa książka albo komiks', cost: 600 },
      { title: 'Dodatkowe kieszonkowe', cost: 400 },
      { title: 'Zabawka z listy marzeń', cost: 2000 },
    ],
  },
  {
    group: 'Ekran i gry',
    hint: 'Lepiej jako nagroda raz na jakiś czas niż codziennie.',
    items: [
      { title: '30 minut gry', cost: 150 },
      { title: 'Wspólne granie na konsoli z rodzicem — wybieram grę', cost: 200 },
    ],
  },
  {
    group: 'Dla innych',
    hint: 'Uczy, że wysiłek może też pomóc komuś innemu.',
    items: [{ title: 'Pomagamy razem: karma dla schroniska albo zbiórka — wybieram, komu', cost: 500 }],
  },
];
