import { WhatsAppIcon } from "@/components/brand/social-icons";

export function WhatsAppFloat({ number }: { number: string }) {
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous écrire sur WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg ring-4 ring-white transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="size-8" />
    </a>
  );
}
