import { TouchEvent, useState } from 'react';
import { Direction } from '../types';

interface SwipeInput {
  onSwipe: (direction: Direction) => void;
}

export const useSwipe = ({ onSwipe }: SwipeInput) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 30; // px

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    // Check if distance is significant
    if (Math.abs(distanceX) < minSwipeDistance && Math.abs(distanceY) < minSwipeDistance) return;

    if (isHorizontal) {
      if (distanceX > 0) onSwipe(Direction.LEFT);
      else onSwipe(Direction.RIGHT);
    } else {
      if (distanceY > 0) onSwipe(Direction.UP);
      else onSwipe(Direction.DOWN);
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};
