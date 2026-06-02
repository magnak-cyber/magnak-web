import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <main style={{ padding: '40px', fontFamily: 'Onest, sans-serif', lineHeight: '1.6', color: 'black', background: '#fff' }}>
      <h1>Polityka Prywatności / Privacy Policy</h1>
      <p>
        Niniejsza Polityka Prywatności została sporządzona zgodnie z przepisami <strong>Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO)</strong> oraz przepisami krajowymi obowiązującymi w Polsce.
      </p>

      <p>
        Szanujemy Twoją prywatność. Dane osobowe są przetwarzane wyłącznie w celu obsługi zapytań i realizacji zleceń związanych z usługami budowlano-remontowymi.
      </p>

      <h2>1. Administrator danych</h2>
      <p>
        Administratorem danych osobowych jest N&B Interiors, e-mail: <a style={{color: "#bd9f4a"}} href="mailto:wykonczenia.nbgroup@gmail.com">wykonczenia.nbgroup@gmail.com</a>.
      </p>

      <h2>2. Zakres zbieranych danych</h2>
      <p>Możemy przetwarzać następujące dane:</p>
      <ul>
        <li>Imię i nazwisko</li>
        <li>Adres e-mail</li>
        <li>Numer telefonu</li>
        <li>Adres budowy/remontu (jeśli konieczny)</li>
        <li>Dane zawarte w formularzach kontaktowych</li>
        <li>Adres IP, dane przeglądarki i pliki cookies</li>
      </ul>

      <h2>3. Cel przetwarzania danych</h2>
      <p>Dane przetwarzamy wyłącznie w celach:</p>
      <ul>
        <li>Realizacji zapytań ofertowych i zamówień usług</li>
        <li>Kontaktu w sprawach dotyczących realizacji usług</li>
        <li>Spełnienia obowiązków prawnych (np. podatkowych)</li>
        <li>Poprawy działania strony i bezpieczeństwa (np. analiza logów)</li>
      </ul>

      <h2>4. Podstawa prawna przetwarzania</h2>
      <ul>
        <li>Art. 6 ust. 1 lit. b RODO – niezbędność do wykonania umowy</li>
        <li>Art. 6 ust. 1 lit. c RODO – obowiązki prawne</li>
        <li>Art. 6 ust. 1 lit. f RODO – uzasadniony interes administratora</li>
      </ul>

      <h2>5. Pliki cookies</h2>
      <p>
        Używamy plików cookies w celu poprawy funkcjonalności strony i analizy statystyk. Możesz kontrolować cookies w ustawieniach swojej przeglądarki.
      </p>

      <h2>6. Odbiorcy danych</h2>
      <p>
        Twoje dane nie są sprzedawane ani udostępniane osobom trzecim do celów marketingowych. Dane mogą być przekazywane wyłącznie:
      </p>
      <ul>
        <li>Firmom hostingowym i IT w ramach obsługi technicznej strony</li>
        <li>Podmiotom świadczącym usługi księgowe lub prawne</li>
        <li>Organom publicznym, jeśli wynika to z obowiązku prawnego</li>
      </ul>

      <h2>7. Okres przechowywania danych</h2>
      <p>
        Dane będą przechowywane przez czas trwania współpracy oraz przez okres wymagany przepisami prawa (np. przechowywanie faktur przez 5 lat).
      </p>

      <h2>8. Twoje prawa</h2>
      <p>Masz prawo do:</p>
      <ul>
        <li>Dostępu do swoich danych osobowych</li>
        <li>Sprostowania danych</li>
        <li>Usunięcia danych („prawo do bycia zapomnianym”)</li>
        <li>Ograniczenia przetwarzania</li>
        <li>Przeniesienia danych</li>
        <li>Sprzeciwu wobec przetwarzania</li>
        <li>Wniesienia skargi do <strong>Prezesa UODO</strong></li>
      </ul>

      <h2>9. Bezpieczeństwo danych</h2>
      <p>
        Stosujemy odpowiednie środki techniczne i organizacyjne, aby zapewnić bezpieczeństwo danych osobowych, w tym szyfrowanie połączeń (SSL), kontrolę dostępu i zabezpieczenia serwerów.
      </p>

      <h2>10. Zmiany w polityce prywatności</h2>
      <p>
        Polityka prywatności może być okresowo aktualizowana. Aktualna wersja będzie zawsze dostępna na naszej stronie internetowej.
      </p>

      <h2>11. Kontakt</h2>
      <p>
        W sprawach związanych z przetwarzaniem danych osobowych, prosimy o kontakt: <a style={{color: "#bd9f4a"}} href="mailto:wykonczenia.nbgroup@gmail.com">wykonczenia.nbgroup@gmail.com</a>.
      </p>

      <footer style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <p>© {new Date().getFullYear()} N&B Interiors. Wszelkie prawa zastrzeżone.</p>
      </footer>
    </main>
  );
};

export default PrivacyPolicy;
