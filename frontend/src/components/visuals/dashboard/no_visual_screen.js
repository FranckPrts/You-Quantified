import React, { useEffect, useRef, useState } from "react";

export default function NoVisualScreen() {
  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];

  const [konamiIndex, setKonamiIndex] = useState(0);
  const [isDino, setIsDino] = useState(false);

  const konamiIndexRef = useRef(konamiIndex);
  konamiIndexRef.current = konamiIndex;

  function konamiCodeFunc(event, konamiIndexRef) {
    // Check if the key pressed matches the current konami sequence key
    if (event.key === konamiCode[konamiIndexRef.current]) {
      setKonamiIndex((prevIndex) => prevIndex + 1);
      // If the entire Konami code is successfully entered
      if (konamiIndexRef.current + 1 === konamiCode.length) {
        alert(
          "Stranger, whoever you are, open this to find what will amaze you",
        );
        setIsDino(true);
        setKonamiIndex(0); // Reset the index
      }
    } else {
      // Reset the index if the key doesn't match
      setKonamiIndex(0);
    }
  }

  const dinoiFrame = (
    <iframe width="500" height="400" src="https://dinosaurgame.app" />
  );

  useEffect(() => {
    document.addEventListener("keydown", (event) =>
      konamiCodeFunc(event, konamiIndexRef),
    );

    return () => {
      document.removeEventListener("keydown", (event) =>
        konamiCodeFunc(event, konamiIndexRef),
      );
    };
  }, []);

  return (
    <div className="h-100 w-100">
      <div className="position-absolute top-50 start-50 translate-middle">
        <h4 className="text-center">Error 404</h4>
        <p>This visual doesn't seem to exist :(</p>
        {isDino && dinoiFrame}
        {konamiIndex > 2 && <p>?</p>}
        {konamiIndex > 5 && <p>??</p>}
      </div>
    </div>
  );
}
