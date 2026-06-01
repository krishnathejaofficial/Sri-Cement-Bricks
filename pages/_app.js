import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          success: { style: { background: '#065f46', color: 'white' } },
          error: { style: { background: '#991b1b', color: 'white' } },
          duration: 4000,
        }}
      />
    </>
  );
}
