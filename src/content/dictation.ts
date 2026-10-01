import type { Topic } from '../types';
import { builtin } from './util';

/*
 * Dyktanda: aplikacja czyta zdanie na głos, dziecko wpisuje brakujący wyraz.
 * Luki nie stoją na początku zdania (wielka litera). Wyjaśnienia podają regułę
 * albo mówią wprost, że pisownię trzeba zapamiętać.
 */

export const DICTATION_GRADE3: Topic = builtin(
  'b-dyktando-3',
  'pl',
  70,
  'Dyktando: ó, rz, ż, ch, h',
  'Posłuchaj zdania i wpisz brakujący wyraz. Uważaj na ó, u, rz, ż, ch i h.',
  `
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Na grządce rośnie zielony [ogórek]. !! Wyraz „ogórek” piszemy przez ó — to trzeba zapamiętać.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Mała [mrówka] niesie listek. !! Mrówka — ó wymienia się na o: mrowisko.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> W zamku mieszka dobry [król]. !! Król — ó wymienia się na o: królowa.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> W słoiku jest słodki [miód]. !! Miód — ó wymienia się na o: miodu.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Stół ma jedną krótszą [nóżkę]. !! Nóżka — ó, bo noga; ż, bo noga (g wymienia się na ż).
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Szeroka [rzeka] płynie przez miasto. !! Wyraz „rzeka” piszemy przez rz — to trzeba zapamiętać.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Latem jedziemy nad [morze]. !! Morze — rz wymienia się na r: morski.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> W lesie rośnie wysokie [drzewo]. !! Po d piszemy rz: drzewo.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Przy stole stoi [krzesło]. !! Po k piszemy rz: krzesło.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Nad stawem siedzi zielona [żaba]. !! Wyraz „żaba” piszemy przez ż — to trzeba zapamiętać.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Na łące rośnie [żółty] mlecz. !! W wyrazie „żółty” ż i ó trzeba zapamiętać.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Po niebie płynie biała [chmura]. !! Wyraz „chmura” piszemy przez ch — to trzeba zapamiętać.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Na śniadanie zjadłem [chleb] z masłem. !! Wyraz „chleb” piszemy przez ch — to trzeba zapamiętać.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Babcia pije gorącą [herbatę]. !! Wyraz „herbata” piszemy przez h — to trzeba zapamiętać.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Na placu zabaw jest nowa [huśtawka]. !! Wyraz „huśtawka” piszemy przez h — to trzeba zapamiętać.
`,
  [3],
);

export const DICTATION_GRADE5: Topic = builtin(
  'b-p5-dyktando',
  'pl',
  70,
  'Dyktando: trudne wyrazy',
  'Posłuchaj zdania i wpisz brakujący wyraz. Przypomnij sobie reguły pisowni ó, rz, ż, ch i h.',
  `
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Mój najlepszy [przyjaciel] mieszka obok. !! Po p piszemy rz: przyjaciel.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Przed wyjściem [trzeba] zgasić światło. !! Po t piszemy rz: trzeba.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> W lesie znalazłem dużego [grzyba]. !! Po g piszemy rz: grzyb.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Przy drodze rośnie biała [brzoza]. !! Po b piszemy rz: brzoza.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Jutro [może] padać deszcz. !! Wyraz „może” (być może) piszemy przez ż, a „morze” (woda) przez rz, bo morski.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Do lasu prowadzi wąska [dróżka]. !! Dróżka — ó, bo droga; ż, bo droga (g wymienia się na ż).
dyktando: Posłuchaj i wpisz brakujący wyraz. >> W nocy był silny [mróz]. !! Mróz — ó wymienia się na o: mrozy.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Wieczorem podziwialiśmy piękny [zachód] słońca. !! Zachód — ó wymienia się na o: zachodu.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Zatemperuj swój [ołówek]. !! Ołówek — ó wymienia się na o: ołowiany.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Na parapecie usiadł mały [wróbel]. !! Wyraz „wróbel” piszemy przez ó — to trzeba zapamiętać.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Nasz [żółw] powoli je sałatę. !! W wyrazie „żółw” ż i ó trzeba zapamiętać.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Dziadek ma ciepły [kożuch]. !! Na końcu wyrazu piszemy ch (wyjątek: druh), a ż w wyrazie „kożuch” trzeba zapamiętać.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Na drzewie siedział zielony [chrząszcz]. !! W wyrazie „chrząszcz” ch i sz trzeba zapamiętać, a rz piszemy po ch.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Za oknem słychać głośny [hałas]. !! Wyraz „hałas” piszemy przez h — to trzeba zapamiętać.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Na urodziny dostałem [hulajnogę]. !! Wyraz „hulajnoga” piszemy przez h — to trzeba zapamiętać.
`,
  [5],
);
