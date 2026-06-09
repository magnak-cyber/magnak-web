import React from 'react';
import { BackButton } from '@/components/common/BackButton/BackButton';
import { getPublicSiteSettings } from '@/lib/siteSettingsStore';

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '24px',
  fontFamily: 'Onest, sans-serif',
  lineHeight: '1.7',
  color: '#f3f3f3',
  background: 'linear-gradient(180deg, #101010, #070707)',
};

const wrapStyle: React.CSSProperties = {
  maxWidth: '920px',
  margin: '0 auto',
};

const contentStyle: React.CSSProperties = {
  marginTop: '18px',
  padding: '24px',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.03)',
  boxShadow: '0 22px 56px rgba(0,0,0,0.35)',
};

const linkStyle: React.CSSProperties = {
  color: '#caaa37',
};

export default async function PrivacyPolicy() {
  const settings = await getPublicSiteSettings();

  return (
    <main style={pageStyle}>
      <div style={wrapStyle}>
        <BackButton label="Wstecz" />
        <div style={contentStyle}>
          <h1>Polityka Prywatnosci / Privacy Policy</h1>
          <p>
            Niniejsza Polityka Prywatnosci zostala sporzadzona zgodnie z przepisami
            <strong> Rozporzadzenia Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO)</strong>
            oraz przepisami krajowymi obowiazujacymi w Polsce.
          </p>

          <p>
            Szanujemy Twoja prywatnosc. Dane osobowe sa przetwarzane wylacznie w celu obslugi zapytan
            i realizacji zlecen zwiazanych z uslugami budowlano-remontowymi.
          </p>

          <h2>1. Administrator danych</h2>
          <p>
            Administratorem danych osobowych jest {settings.companyName}, e-mail:{' '}
            <a style={linkStyle} href={`mailto:${settings.publicEmail}`}>{settings.publicEmail}</a>, tel.{' '}
            <a style={linkStyle} href={`tel:${settings.publicPhone.replace(/[^\d+]/g, '')}`}>{settings.publicPhone}</a>.
          </p>

          <h2>2. Zakres zbieranych danych</h2>
          <p>Mozemy przetwarzac nastepujace dane:</p>
          <ul>
            <li>Imie i nazwisko</li>
            <li>Adres e-mail</li>
            <li>Numer telefonu</li>
            <li>Adres budowy lub remontu, jesli jest konieczny</li>
            <li>Dane zawarte w formularzach kontaktowych</li>
            <li>Adres IP, dane przegladarki i pliki cookies</li>
          </ul>

          <h2>3. Cel przetwarzania danych</h2>
          <p>Dane przetwarzamy wylacznie w celach:</p>
          <ul>
            <li>Realizacji zapytan ofertowych i zamowien uslug</li>
            <li>Kontaktu w sprawach dotyczacych realizacji uslug</li>
            <li>Spelnienia obowiazkow prawnych, na przyklad podatkowych</li>
            <li>Poprawy dzialania strony i bezpieczenstwa</li>
          </ul>

          <h2>4. Podstawa prawna przetwarzania</h2>
          <ul>
            <li>Art. 6 ust. 1 lit. b RODO - niezbednosc do wykonania umowy</li>
            <li>Art. 6 ust. 1 lit. c RODO - obowiazki prawne</li>
            <li>Art. 6 ust. 1 lit. f RODO - uzasadniony interes administratora</li>
          </ul>

          <h2>5. Pliki cookies</h2>
          <p>
            Uzywamy plikow cookies w celu poprawy funkcjonalnosci strony i analizy statystyk.
            Mozesz kontrolowac cookies w ustawieniach swojej przegladarki.
          </p>

          <h2>6. Odbiorcy danych</h2>
          <p>
            Twoje dane nie sa sprzedawane ani udostepniane osobom trzecim do celow marketingowych.
            Dane moga byc przekazywane wylacznie:
          </p>
          <ul>
            <li>Firmom hostingowym i IT w ramach obslugi technicznej strony</li>
            <li>Podmiotom swiadczacym uslugi ksiegowe lub prawne</li>
            <li>Organom publicznym, jesli wynika to z obowiazku prawnego</li>
          </ul>

          <h2>7. Okres przechowywania danych</h2>
          <p>
            Dane beda przechowywane przez czas trwania wspolpracy oraz przez okres wymagany przepisami prawa.
          </p>

          <h2>8. Twoje prawa</h2>
          <p>Masz prawo do:</p>
          <ul>
            <li>Dostepu do swoich danych osobowych</li>
            <li>Sprostowania danych</li>
            <li>Usuniecia danych</li>
            <li>Ograniczenia przetwarzania</li>
            <li>Przeniesienia danych</li>
            <li>Sprzeciwu wobec przetwarzania</li>
            <li>Wniesienia skargi do Prezesa UODO</li>
          </ul>

          <h2>9. Bezpieczenstwo danych</h2>
          <p>
            Stosujemy odpowiednie srodki techniczne i organizacyjne, aby zapewnic bezpieczenstwo danych osobowych,
            w tym szyfrowanie polaczen, kontrole dostepu i zabezpieczenia serwerow.
          </p>

          <h2>10. Zmiany w polityce prywatnosci</h2>
          <p>
            Polityka prywatnosci moze byc okresowo aktualizowana. Aktualna wersja bedzie zawsze dostepna na naszej stronie internetowej.
          </p>

          <h2>11. Kontakt</h2>
          <p>
            W sprawach zwiazanych z przetwarzaniem danych osobowych prosimy o kontakt:{' '}
            <a style={linkStyle} href={`mailto:${settings.publicEmail}`}>{settings.publicEmail}</a>, tel.{' '}
            <a style={linkStyle} href={`tel:${settings.publicPhone.replace(/[^\d+]/g, '')}`}>{settings.publicPhone}</a>.
          </p>

          <footer style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '20px', color: '#cfcfcf' }}>
            <p>© {new Date().getFullYear()} {settings.companyName}. Wszelkie prawa zastrzezone.</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
