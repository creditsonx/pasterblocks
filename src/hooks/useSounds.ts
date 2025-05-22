import { useCallback, useEffect, useState } from 'react';

// Sound files to preload
const SOUND_FILES = {
  move: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
  rotate: 'https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3',
  drop: 'https://assets.mixkit.co/sfx/preview/mixkit-player-jumping-in-a-video-game-2043.mp3',
  clear: 'https://assets.mixkit.co/sfx/preview/mixkit-video-game-win-2016.mp3',
  levelUp: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3',
  gameOver: 'https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-game-over-470.mp3',
  reward: 'https://assets.mixkit.co/sfx/preview/mixkit-bonus-earned-in-video-game-2058.mp3'
};

export type SoundEffect = keyof typeof SOUND_FILES;

export const useSounds = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [audioElements, setAudioElements] = useState<Record<SoundEffect, HTMLAudioElement | null>>({
    move: null,
    rotate: null,
    drop: null,
    clear: null,
    levelUp: null,
    gameOver: null,
    reward: null
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload all sound effects
  useEffect(() => {
    let loadedCount = 0;
    const totalSounds = Object.keys(SOUND_FILES).length;
    const tempAudioElements: Record<SoundEffect, HTMLAudioElement> = {} as Record<SoundEffect, HTMLAudioElement>;

    for (const [key, url] of Object.entries(SOUND_FILES)) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.5; // Set default volume

      audio.addEventListener('canplaythrough', () => {
        loadedCount++;
        if (loadedCount === totalSounds) {
          setIsLoaded(true);
        }
      });

      tempAudioElements[key as SoundEffect] = audio;
    }

    setAudioElements(tempAudioElements);

    // Cleanup
    return () => {
      for (const audio of Object.values(tempAudioElements)) {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      }
    };
  }, []);

  // Play a sound effect
  const playSound = useCallback((sound: SoundEffect) => {
    if (isMuted || !isLoaded || !audioElements[sound]) return;

    // Stop and reset the audio before playing
    const audio = audioElements[sound] as HTMLAudioElement;
    audio.pause();
    audio.currentTime = 0;

    // Play the sound with a small random delay to avoid overlapping
    setTimeout(() => {
      audio.play().catch(error => {
        console.error('Error playing sound:', error);
      });
    }, Math.random() * 50);
  }, [audioElements, isMuted, isLoaded]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prevMuted => !prevMuted);
  }, []);

  return {
    playSound,
    isMuted,
    toggleMute,
    isLoaded
  };
};
