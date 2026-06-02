import React from 'react';

const Terms: React.FC = () => {
  return (
    <main style={{ padding: '40px', fontFamily: 'Onest, sans-serif', lineHeight: '1.6', background: 'white' }}>
      <h1>Regulamin Serwisu / Terms and Conditions</h1>

      <p>
        Niniejszy regulamin określa zasady korzystania z serwisu internetowego prowadzonego przez N&B Interiors. Korzystając z tej strony, akceptujesz poniższe warunki.
      </p>

      <h2>1. Definicje</h2>
      <p>
        <strong>Użytkownik</strong> – każda osoba fizyczna lub prawna korzystająca z serwisu internetowego.<br />
        <strong>Usługodawca</strong> – N&B Interiors, właściciel serwisu.
      </p>

      <h2>2. Zakres usług</h2>
      <p>
        Serwis umożliwia składanie zapytań dotyczących usług budowlanych i remontowych. Informacje mają charakter ogólny i nie stanowią oferty handlowej w rozumieniu Kodeksu cywilnego.
      </p>

      <h2>3. Prawa autorskie</h2>
      <p>
        Cała zawartość strony – teksty, grafiki, zdjęcia, logotypy – stanowi własność Usługodawcy lub jego partnerów i podlega ochronie prawnej. Jakiekolwiek kopiowanie lub rozpowszechnianie bez pisemnej zgody jest zabronione.
      </p>

      <h2>4. Obowiązki użytkownika</h2>
      <p>
        Użytkownik zobowiązuje się do korzystania z serwisu zgodnie z przepisami prawa, w sposób niezakłócający działania serwisu i nie naruszający praw osób trzecich.
      </p>

      <h2>5. Ograniczenie odpowiedzialności</h2>
      <p>
        Serwis dostępny jest "w stanie takim, w jakim jest". Usługodawca nie ponosi odpowiedzialności za błędy, przerwy w dostępności czy nieaktualność treści. Korzystanie z serwisu odbywa się na własne ryzyko użytkownika.
      </p>

      <h2>6. Linki zewnętrzne</h2>
      <p>
        Serwis może zawierać odnośniki do innych stron internetowych. Usługodawca nie odpowiada za treści ani politykę prywatności stron zewnętrznych.
      </p>

      <h2>7. Prawo właściwe</h2>
      <p>
        Niniejszy regulamin podlega prawu Rzeczypospolitej Polskiej oraz przepisom Unii Europejskiej. Wszelkie spory będą rozstrzygane przez sąd właściwy miejscowo dla siedziby Usługodawcy.
      </p>

      <h2>8. Zmiany regulaminu</h2>
      <p>
        Usługodawca zastrzega sobie prawo do wprowadzania zmian w regulaminie w dowolnym czasie. Zmieniony regulamin wchodzi w życie z chwilą jego publikacji na stronie internetowej.
      </p>

      <h2>9. Kontakt</h2>
      <p>
        W razie pytań dotyczących regulaminu prosimy o kontakt: <a style={{color: "#bd9f4a"}} href="mailto:wykonczenia.nbgroup@gmail.com">wykonczenia.nbgroup@gmail.com</a>.
      </p>

      <footer style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <p>© {new Date().getFullYear()} N&B Interiors. Wszelkie prawa zastrzeżone.</p>
      </footer>
    </main>
  );
};

export default Terms;
