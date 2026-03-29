const WHATSAPP_NUMBER = '9779844127675'; // +977 984 4127675 without + or spaces
const DEFAULT_MSG = encodeURIComponent('Hello! I have a query about Ambe General Store.');

export default function WhatsAppButton() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MSG}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      style={{ backgroundColor: '#25D366' }}
      title="Chat with us on WhatsApp"
    >
      {/* WhatsApp SVG icon */}
      <svg viewBox="0 0 32 32" width="28" height="28" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.648 4.83 1.78 6.86L2 30l7.34-1.74A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 0 1-5.83-1.6l-.42-.25-4.35 1.03 1.06-4.24-.27-.44A11.46 11.46 0 0 1 4.5 16C4.5 9.596 9.596 4.5 16 4.5S27.5 9.596 27.5 16 22.404 27.5 16 27.5zm6.29-8.57c-.34-.17-2.02-1-2.34-1.11-.32-.11-.55-.17-.78.17-.23.34-.9 1.11-1.1 1.34-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.01-1.9-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.78-1.88-1.07-2.57-.28-.67-.57-.58-.78-.59h-.66c-.23 0-.6.09-.91.43-.31.34-1.19 1.16-1.19 2.83s1.22 3.28 1.39 3.51c.17.23 2.4 3.67 5.82 5.14.81.35 1.44.56 1.93.72.81.26 1.55.22 2.13.13.65-.1 2.02-.83 2.3-1.63.28-.8.28-1.49.2-1.63-.09-.14-.32-.23-.66-.4z"/>
      </svg>
    </a>
  );
}
