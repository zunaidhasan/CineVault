'use client';

import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            disabled={readonly}
            className={`${sizes[size]} ${readonly ? 'cursor-default' : 'star-interactive'}`}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => !readonly && setHover(n)}
            onMouseLeave={() => !readonly && setHover(0)}
          >
            {filled ? (
              <StarSolid className="w-full h-full text-yellow-500" />
            ) : (
              <StarOutline className="w-full h-full text-gray-600" />
            )}
          </button>
        );
      })}
      {!readonly && <span className="ml-2 text-sm text-gray-400">{hover || value || 0}/10</span>}
    </div>
  );
}
