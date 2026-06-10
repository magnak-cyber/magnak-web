# Instrukcja przekazania projektu - Magnak Wykończenia

Dokument przygotowany dla klienta. Opisuje stronę internetową, panel administracyjny, bazę danych, pocztę, linki projektowe oraz miejsca, w których można wprowadzać zmiany.

## 1. Najważniejsze linki

| Element | Link | Do czego służy |
|---|---|---|
| Repozytorium GitHub | [magnak-cyber/magnak-web](https://github.com/magnak-cyber/magnak-web) | Kod źródłowy projektu, historia zmian, wdrożenia przez GitHub/Vercel |
| Projekt Vercel | https://vercel.com/magnak-cybers-projects/magnak | Produkcyjne wdrożenie strony i panelu administracyjnego |
| MongoDB Atlas | https://cloud.mongodb.com/v2/6a29d665fa96739bef685918#/explorer/6a29d6c3556d0ead11e58acb | Baza danych: zamówienia, ustawienia firmy, obrazy projektów, kody logowania do admina |
| Strona publiczna | https://magnak-theta.vercel.app/ | Aktualna publiczna wersja strony |

## 2. Ważne informacje techniczne

- Wiadomości o nowych zamówieniach oraz kody do logowania w panelu administracyjnym są wysyłane z adresu `infomagnak@gmail.com`.
- Panel administracyjny korzysta z kodu jednorazowego wysyłanego na dozwolony adres e-mail.
- Logo i favicon są obecnie stałe i nie są edytowane z poziomu panelu administracyjnego.
- Dane strony są przechowywane w MongoDB Atlas.
- Część ustawień publicznych automatycznie aktualizuje nagłówek, stopkę oraz strony prawne.

## 3. Strony publiczne

Poniżej znajduje się lista wszystkich głównych stron serwisu. Do każdej sekcji warto dodać zrzut ekranu, żeby klient łatwo kojarzył widok z opisem.

| Strona | Adres | Opis | Zrzut ekranu |
|---|---|---|---|
| Strona główna | https://magnak-theta.vercel.app/ | Główna prezentacja firmy, sekcje usług, etapy pracy, przyciski kontaktowe | `docs/screenshots/01-home.png` |
| O nas | https://magnak-theta.vercel.app/aboutUs | Opis firmy i jej działalności | `docs/screenshots/02-about-us.png` |
| Kontakt / formularz | https://magnak-theta.vercel.app/contactPage | Pełnoekranowy formularz kontaktowy/zamówienia | `docs/screenshots/03-contact-form.png` |
| Projekty | https://magnak-theta.vercel.app/projects | Galeria realizacji z podglądem zdjęć | `docs/screenshots/04-projects.png` |
| Polityka prywatności | https://magnak-theta.vercel.app/privacy-policy | Dokument prawny na ciemnym tle z przyciskiem powrotu | `docs/screenshots/05-privacy-policy.png` |
| Regulamin | https://magnak-theta.vercel.app/terms | Dokument prawny na ciemnym tle z przyciskiem powrotu | `docs/screenshots/06-terms.png` |

### 3.1. Strony kategorii usług

Te strony są tworzone dynamicznie i pokazują szczegóły wybranej kategorii usług.

| Strona | Adres | Opis | Zrzut ekranu |
|---|---|---|---|
| Wykończenia wnętrz | https://magnak-theta.vercel.app/finishes | Szczegóły usługi związanej z wykończeniem wnętrz | `docs/screenshots/07-finishes.png` |
| Łazienki | https://magnak-theta.vercel.app/bathroom | Szczegóły usługi dotyczącej łazienek | `docs/screenshots/08-bathroom.png` |
| Remonty | https://magnak-theta.vercel.app/renovations | Szczegóły usługi remontowej | `docs/screenshots/09-renovations.png` |
| Kamień naturalny | https://magnak-theta.vercel.app/naturalstone | Szczegóły usługi kamienia naturalnego | `docs/screenshots/10-naturalstone.png` |
| Kuchnie | https://magnak-theta.vercel.app/kitchen | Szczegóły usługi kuchni | `docs/screenshots/11-kitchen.png` |
| Tarasy i balkony | https://magnak-theta.vercel.app/terraces | Szczegóły usługi tarasów i balkonów | `docs/screenshots/12-terraces.png` |
| Pokoje | https://magnak-theta.vercel.app/rooms | Szczegóły usługi pokojów i wnętrz | `docs/screenshots/13-rooms.png` |
| Ogrodzenia | https://magnak-theta.vercel.app/fences | Szczegóły usługi ogrodzeń | `docs/screenshots/14-fences.png` |

## 4. Jak klient składa zamówienie

Formularz zamówienia działa krok po kroku.

| Krok | Co robi użytkownik | Co warto pokazać na screenie |
|---|---|---|
| 1 | Wpisuje imię, telefon i e-mail | `docs/screenshots/15-order-step-1.png` |
| 2 | Wybiera lokalizację, typ usługi i termin rozpoczęcia | `docs/screenshots/16-order-step-2.png` |
| 3 | Dodaje opis, plik i zgody RODO | `docs/screenshots/17-order-step-3.png` |
| 4 | Wysyła formularz | `docs/screenshots/18-order-success.png` |

### 4.1. Co dzieje się po wysłaniu formularza

- Zamówienie zapisuje się w bazie MongoDB.
- Na adres `EMAIL_RECEIVER` przychodzi wiadomość z treścią zamówienia.
- Jeśli w ustawieniach wskazano `infomagnak@gmail.com`, to z tego adresu wychodzą wiadomości systemowe.

## 5. Logowanie do panelu administracyjnego

Panel administracyjny jest dostępny pod adresem:

https://magnak-theta.vercel.app/admin

### 5.1. Proces logowania

| Etap | Co się dzieje | Zrzut ekranu |
|---|---|---|
| 1 | Wejście na stronę ` /admin ` | `docs/screenshots/19-admin-login-email.png` |
| 2 | Podanie dozwolonego adresu e-mail | `docs/screenshots/20-admin-request-code.png` |
| 3 | Otrzymanie 6-cyfrowego kodu na e-mail | `docs/screenshots/21-admin-code-mail.png` |
| 4 | Wpisanie kodu i wejście do panelu | `docs/screenshots/22-admin-code-entry.png` |
| 5 | Widok panelu po zalogowaniu | `docs/screenshots/23-admin-dashboard.png` |

### 5.2. Adresy e-mail z dostępem do panelu

Lista e-maili uprawnionych do logowania jest przechowywana w MongoDB w polu `adminEmails` w kolekcji `site_settings`.

Obecnie w tej liście powinny znajdować się przynajmniej:

- `magnakglazurnictwo@gmail.com`
- `infomagnak@gmail.com`

## 6. Funkcje panelu administracyjnego

Panel ma trzy główne zakładki:

| Zakładka | Co można robić | Zrzut ekranu |
|---|---|---|
| Zamówienia | Przeglądać, edytować, usuwać, filtrować, sortować i dodawać zamówienia | `docs/screenshots/24-admin-orders.png` |
| Galeria projektów | Dodawać obrazy, importować z folderu, obracać i usuwać zdjęcia | `docs/screenshots/25-admin-gallery.png` |
| Ustawienia firmy | Zmieniać dane firmy, e-mail powiadomień, publiczny e-mail, telefon i listę e-maili adminów | `docs/screenshots/26-admin-company-settings.png` |

### 6.1. Zamówienia

W zakładce **Zamówienia** można:

- dodać nowe zamówienie ręcznie,
- edytować istniejące zamówienie,
- zmienić status zamówienia,
- usunąć zamówienie,
- filtrować po statusie,
- sortować po dacie i statusie,
- wybrać liczbę rekordów na stronie.

Zamówienia są przechowywane w kolekcji `orders`.

### 6.2. Galeria projektów

W zakładce **Galeria projektów** można:

- dodać pojedyncze obrazy,
- zaimportować obrazy z folderu,
- obrócić obraz,
- usunąć obraz,
- odświeżyć listę obrazów.

Obrazy są przechowywane w kolekcji `project_images` jako dane pikselowe w MongoDB.

### 6.3. Ustawienia firmy

W zakładce **Ustawienia firmy** można zmienić:

- nazwę firmy,
- e-mail do powiadomień o zamówieniach,
- publiczny e-mail widoczny na stronie,
- publiczny numer telefonu,
- listę e-maili, które mogą logować się do panelu admina.

Ustawienia są przechowywane w kolekcji `site_settings`.

### 6.4. Co nie jest edytowalne z panelu

- Logo strony
- Favicon
- Główny tytuł w karcie przeglądarki

Te elementy są obecnie stałe i zmienia się je technicznie w projekcie, a nie z poziomu formularza panelu.

## 7. MongoDB Atlas - co gdzie jest zapisane

| Kolekcja | Zawartość | Do czego służy |
|---|---|---|
| `orders` | Zamówienia klientów | Historia wszystkich zgłoszeń z formularza i dodanych ręcznie |
| `site_settings` | Dane firmy i lista adminów | Nazwa firmy, telefon, e-mail, e-mail powiadomień, `adminEmails` |
| `branding_assets` | Logo i favicon | Stałe pliki brandingu strony |
| `project_images` | Zdjęcia projektów | Galeria realizacji na stronie `/projects` |
| `admin_otps` | Kody logowania | Jednorazowe kody do logowania w panelu admina |

## 8. E-mail i powiadomienia

### 8.1. Skąd wychodzą wiadomości

Wiadomości systemowe wychodzą z:

- `infomagnak@gmail.com`

To konto jest używane do:

- wysyłania potwierdzeń i wiadomości związanych z zamówieniami,
- wysyłania kodu logowania do panelu administracyjnego.

### 8.2. Co trzeba ustawić technicznie

W Vercel trzeba mieć poprawnie ustawione:

- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `EMAIL_RECEIVER`

Jeżeli używany jest Gmail, `EMAIL_PASS` powinien być hasłem aplikacji, a nie zwykłym hasłem do konta.

## 9. Gdzie zmieniać dane

### 9.1. Przez panel administracyjny

Najczęstsze zmiany, które klient może robić sam:

- edycja zamówień,
- zmiana statusów,
- usuwanie zamówień,
- dodawanie nowych zamówień,
- dodawanie i usuwanie zdjęć w galerii,
- import zdjęć z folderu,
- zmiana danych firmy,
- dodawanie nowych e-maili administratorów.

### 9.2. W bazie danych

Jeżeli trzeba poprawić dane bezpośrednio:

- `site_settings` - dane firmy i administratorów,
- `orders` - wszystkie zamówienia,
- `project_images` - obrazy galerii,
- `admin_otps` - kody logowania,
- `branding_assets` - logo i favicon.

### 9.3. W ustawieniach Vercel

W Vercel zmienia się:

- połączenie z MongoDB,
- konfigurację poczty,
- sekret sesji admina,
- publiczny adres strony.

## 10. Lista kontrolna po przekazaniu projektu

1. Sprawdź, czy strona publiczna działa pod linkiem produkcyjnym.
2. Sprawdź, czy formularz zamówienia wysyła wiadomości.
3. Sprawdź, czy kod do panelu admina przychodzi na `infomagnak@gmail.com`.
4. Sprawdź, czy panel admina otwiera się po wpisaniu poprawnego kodu.
5. Sprawdź, czy zamówienia zapisują się w MongoDB.
6. Sprawdź, czy obrazy w galerii są widoczne w `/projects`.
7. Sprawdź, czy ustawienia firmy zapisują się w `site_settings`.
8. Dodaj wszystkie potrzebne zrzuty ekranu do folderu `docs/screenshots/`.

## 11. Miejsce na zrzuty ekranu

Proponowany układ plików:

```text
docs/screenshots/01-home.png
docs/screenshots/02-about-us.png
docs/screenshots/03-contact-form.png
docs/screenshots/04-projects.png
docs/screenshots/05-privacy-policy.png
docs/screenshots/06-terms.png
docs/screenshots/07-finishes.png
docs/screenshots/08-bathroom.png
docs/screenshots/09-renovations.png
docs/screenshots/10-naturalstone.png
docs/screenshots/11-kitchen.png
docs/screenshots/12-terraces.png
docs/screenshots/13-rooms.png
docs/screenshots/14-fences.png
docs/screenshots/15-order-step-1.png
docs/screenshots/16-order-step-2.png
docs/screenshots/17-order-step-3.png
docs/screenshots/18-order-success.png
docs/screenshots/19-admin-login-email.png
docs/screenshots/20-admin-request-code.png
docs/screenshots/21-admin-code-mail.png
docs/screenshots/22-admin-code-entry.png
docs/screenshots/23-admin-dashboard.png
docs/screenshots/24-admin-orders.png
docs/screenshots/25-admin-gallery.png
docs/screenshots/26-admin-company-settings.png
```

## 12. Krótkie podsumowanie dla klienta

Projekt Magnak Wykończenia zawiera:

- publiczną stronę firmową,
- stronę z projektami,
- formularz zamówienia,
- panel administracyjny z kodem logowania,
- integrację z MongoDB Atlas,
- wysyłkę e-maili z adresu `infomagnak@gmail.com`.

Jeżeli klient chce zmienić dane firmy, najprościej robi to w zakładce **Ustawienia firmy**. Jeżeli chce zmienić coś technicznego, np. logo, favicon albo strukturę strony, trzeba to zrobić w kodzie źródłowym projektu.

## 13. Techniczne adresy API

Ta sekcja jest przydatna dla osoby technicznej lub supportu. Klient zwykle nie musi z niej korzystać bezpośrednio, ale dobrze wiedzieć, za co odpowiadają poszczególne adresy.

| Endpoint | Do czego służy |
|---|---|
| `/api/contact` | Zapisuje nowe zamówienie z formularza kontaktowego i wysyła e-mail |
| `/api/site-settings` | Pobiera publiczne ustawienia firmy na stronę |
| `/api/branding/logo` | Zwraca logo strony |
| `/api/branding/favicon` | Zwraca favicon strony |
| `/api/projects/images` | Pobiera listę obrazów galerii |
| `/api/projects/images/[id]` | Pobiera pojedynczy obraz galerii |
| `/api/admin/auth/request-code` | Wysyła kod logowania do panelu admina |
| `/api/admin/auth/verify-code` | Weryfikuje kod logowania i tworzy sesję |
| `/api/admin/auth/session` | Sprawdza aktywną sesję admina |
| `/api/admin/auth/logout` | Wylogowuje użytkownika z panelu admina |
| `/api/admin/orders` | Pobiera i tworzy zamówienia w panelu admina |
| `/api/admin/orders/[id]` | Edytuje lub usuwa pojedyncze zamówienie |
| `/api/admin/project-images` | Dodaje obrazy do galerii |
| `/api/admin/project-images/import` | Importuje obrazy z folderu do MongoDB |
| `/api/admin/project-images/[id]` | Obraca lub usuwa pojedynczy obraz |
| `/api/admin/site-settings` | Zapisuje ustawienia firmy i listę e-maili admina |
