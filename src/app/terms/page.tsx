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

export default async function Terms() {
  const settings = await getPublicSiteSettings();

  return (
    <main style={pageStyle}>
      <div style={wrapStyle}>
        <BackButton label="Wstecz" />
        <div style={contentStyle}>
          <h1>Regulamin Serwisu / Terms and Conditions</h1>

          <p>
            Niniejszy regulamin okresla zasady korzystania z serwisu internetowego prowadzonego przez {settings.companyName}.
            Korzystajac z tej strony, akceptujesz ponizsze warunki.
          </p>

          <h2>1. Definicje</h2>
          <p>
            <strong>Uzytkownik</strong> - kazda osoba fizyczna lub prawna korzystajaca z serwisu internetowego.
            <br />
            <strong>Uslugodawca</strong> - {settings.companyName}, wlasciciel serwisu.
          </p>

          <h2>2. Zakres uslug</h2>
          <p>
            Serwis umozliwia skladanie zapytan dotyczacych uslug budowlanych i remontowych.
            Informacje maja charakter ogolny i nie stanowia oferty handlowej w rozumieniu Kodeksu cywilnego.
          </p>

          <h2>3. Prawa autorskie</h2>
          <p>
            Cala zawartosc strony - teksty, grafiki, zdjecia i logotypy - stanowi wlasnosc Uslugodawcy
            lub jego partnerow i podlega ochronie prawnej. Kopiowanie lub rozpowszechnianie bez pisemnej zgody jest zabronione.
          </p>

          <h2>4. Obowiazki uzytkownika</h2>
          <p>
            Uzytkownik zobowiazuje sie do korzystania z serwisu zgodnie z przepisami prawa, w sposob nienaruszajacy
            praw osob trzecich i niezaklocajacy dzialania serwisu.
          </p>

          <h2>5. Ograniczenie odpowiedzialnosci</h2>
          <p>
            Serwis dostepny jest "w stanie takim, w jakim jest". Uslugodawca nie ponosi odpowiedzialnosci
            za bledy, przerwy w dostepnosci czy nieaktualnosc tresci. Korzystanie z serwisu odbywa sie na wlasne ryzyko uzytkownika.
          </p>

          <h2>6. Linki zewnetrzne</h2>
          <p>
            Serwis moze zawierac odnosniki do innych stron internetowych. Uslugodawca nie odpowiada
            za tresci ani polityke prywatnosci stron zewnetrznych.
          </p>

          <h2>7. Prawo wlasciwe</h2>
          <p>
            Niniejszy regulamin podlega prawu Rzeczypospolitej Polskiej oraz przepisom Unii Europejskiej.
            Wszelkie spory beda rozstrzygane przez sad wlasciwy miejscowo dla siedziby Uslugodawcy.
          </p>

          <h2>8. Zmiany regulaminu</h2>
          <p>
            Uslugodawca zastrzega sobie prawo do wprowadzania zmian w regulaminie w dowolnym czasie.
            Zmieniony regulamin wchodzi w zycie z chwila jego publikacji na stronie internetowej.
          </p>

          <h2>9. Kontakt</h2>
          <p>
            W razie pytan dotyczacych regulaminu prosimy o kontakt:{' '}
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
