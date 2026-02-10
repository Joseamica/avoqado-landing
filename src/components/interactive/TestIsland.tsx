import React, { useEffect } from 'react';

export default function TestIsland() {
  useEffect(() => {
    console.log('TestIsland: Hydrated');
  }, []);

  return (
    <div className="fixed top-0 right-0 p-4 bg-red-600 text-white z-[9999]">
      Test Island Active
    </div>
  );
}
