'use client';

import { useState } from 'react';

interface Props {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        {children}
      </div>
      {show && (
        <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-full ml-2 w-64 whitespace-normal">
          {content}
          <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      )}
    </div>
  );
}
