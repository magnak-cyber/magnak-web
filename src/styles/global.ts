// src/styles/global.ts

// Пример общих стилевых переменных или миксинов, если вы используете их в проекте
export const spacing = {
  small: '8px',
  medium: '16px',
  large: '24px',
  extraLarge: '48px',
};

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
};

export const shadows = {
  small: '0 2px 5px rgba(0,0,0,0.05)',
  medium: '0 4px 10px rgba(0,0,0,0.1)',
  large: '0 8px 20px rgba(0,0,0,0.15)',
};

// Если вы используете CSS-in-JS, здесь могут быть глобальные стили,
// например, с помощью styled-components:
// import { createGlobalStyle } from 'styled-components';
// export const GlobalStyle = createGlobalStyle`
//   body {
//     font-family: ...;
//     color: ${colors.text};
//     background-color: ${colors.background};
//   }
// `;