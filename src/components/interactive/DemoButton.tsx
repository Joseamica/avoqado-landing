import { useState } from 'react';
import DemoDialog from './DemoDialog';

export default function DemoButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="demo-btn px-5 py-2.5 rounded-full hover:scale-105 transition-all font-semibold shadow-lg cursor-pointer bg-white text-black hover:bg-gray-100"
      >
        Obtén demo
      </button>
      <DemoDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
