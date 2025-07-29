'use client';
import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const consentValue = localStorage.getItem('cookieConsent');
    setConsent(consentValue === 'true');
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setConsent(true);
  };

  if (consent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center">
      <span>
        We use cookies to ensure you get the best experience on our website.
        By browsing, you agree to our use of cookies.
      </span>
      <button onClick={handleAccept} className="bg-blue-600 px-4 py-2 rounded-md">
        Accept
      </button>
    </div>
  );
}

