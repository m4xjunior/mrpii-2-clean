import React, { useState, useEffect } from 'react';
import './RotatingText.css';

interface RotatingTextProps {
  words: string[];
  period?: number;
}

const RotatingText: React.FC<RotatingTextProps> = ({ words, period = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(words[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % words.length;
        setCurrentWord(words[nextIndex]);
        return nextIndex;
      });
    }, period);

    return () => clearInterval(intervalId);
  }, [words, period]);

  return (
    <span className="flex flex-wrap whitespace-pre-wrap relative rotating-text-scada">
      <span className="text-rotate" aria-hidden="true">
        <span className="text-rotate-word">
          {currentWord.split('').map((char, index) => (
            <span
              key={`${currentWord}-${index}`}
              className="text-rotate-element"
              style={{ transitionDelay: `${index * 50}ms` }}
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