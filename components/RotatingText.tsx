import React, { useState, useEffect } from 'react';
import './RotatingText.css';

interface RotatingTextProps {
  words: string[];
  period?: number;
}

const RotatingText: React.FC<RotatingTextProps> = ({ words, period = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const animationInterval = period - 500; // Give time for exit animation

    const intervalId = setInterval(() => {
      setIsVisible(false); // Trigger exit animation

      setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % words.length;
          setCurrentWord(words[nextIndex]);
          setIsVisible(true); // Trigger enter animation
          return nextIndex;
        });
      }, 500); // Corresponds to animation duration
    }, period);

    return () => clearInterval(intervalId);
  }, [words, period]);

  return (
    <span className="flex flex-wrap whitespace-pre-wrap relative rotating-text-scada">
      <span className="text-rotate" aria-hidden="true">
        <span className={`text-rotate-word ${isVisible ? 'visible' : ''}`}>
          {currentWord.split('').map((char, index) => (
            <span
              key={`${currentWord}-${index}`}
              className="text-rotate-element"
              style={{ transitionDelay: `${index * 40}ms` }}
            >
              {char}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
};

export default RotatingText;