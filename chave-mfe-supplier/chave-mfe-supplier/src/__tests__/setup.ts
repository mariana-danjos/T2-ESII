import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// jsdom (jest) does not expose TextEncoder/TextDecoder, which @mui/x-data-grid requires.
Object.assign(globalThis, { TextEncoder, TextDecoder });
