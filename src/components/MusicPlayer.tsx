// src/components/MusicPlayer.tsx
import React, { useRef, useEffect, useState} from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaVolumeOff, FaStepBackward, FaStepForward, FaMusic, FaRedo, FaRandom } from 'react-icons/fa'
import { TbRepeatOnce } from 'react-icons/tb'; // Example for 'repeat one' icon

interface MusicPlayerProps {
  trackSrc: string | null; // URL of the track to play, or null if none selected
  trackTitle: string; // Add title prop
  albumArtSrc: string | null | undefined; // Add art source prop
  onPlayNext: () => void; // Handler for next button
  onPlayPrevious: () => void; // Handler for previous button
  hasNext: boolean; // Flag to enable/disable next button
  hasPrevious: boolean; // Flag to enable/disable previous button
  repeatMode: 'none' | 'one' | 'all';
  onToggleRepeat: () => void;
  onTrackEnd: () => void; // Callback for when track finishes
  isShuffled: boolean;
  onToggleShuffle: () => void;
}


// Helper function to format time (e.g., 123 seconds -> "02:03")
const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds === Infinity) {
      return '00:00';
    }
    const floorTime = Math.floor(timeInSeconds);
    const minutes = Math.floor(floorTime / 60);
    const seconds = floorTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
    trackSrc,
    trackTitle,
    albumArtSrc, 
    onPlayNext,
    onPlayPrevious,
    hasNext,
    hasPrevious, 
    repeatMode,
    onToggleRepeat,
    onTrackEnd,
    isShuffled,
    onToggleShuffle,
}) => {
    const audioRef = useRef<HTMLAudioElement>(null); // Ref to access the audio element

   // State variables
    const [isPlaying, setIsPlaying] = useState(false); // checks if the song is playing
    const [duration, setDuration] = useState(0); // current song duration
    const [currentTime, setCurrentTime] = useState(0); // follows time as song plays
    const [isMetadataLoaded, setIsMetadataLoaded] = useState(false); // Track if duration is ready
    const [volume, setVolume] = useState(1); // Volume range: 0 to 1 (1 = 100%)
    const [isMuted, setIsMuted] = useState(false); // Optional: For mute toggle state
    const previousVolumeRef = useRef(1); // Store volume before muting
 

   // --- Event Handlers for Audio Element ---

    // Update duration when metadata loads
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
        setDuration(audioRef.current.duration);
        setIsMetadataLoaded(true); // Mark metadata as loaded
        }
    }; // No dependencies, function identity is stable


    // Update current time as the track plays
    const handleTimeUpdate = () => {
        if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        }
    } // No dependencies

    // Reset state when track ends
    const handleTrackEnd = () => {
        setIsPlaying(false);
        // Optional: set currentTime back to 0? Or implement play next?
        if (repeatMode !== 'one') {
            onTrackEnd(); //moves on once the track ends
         }
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
    }; 

    

  // --- Control Handlers ---

    // Toggle play/pause
    const togglePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
        audioRef.current.pause();
        } else {
        // Attempt to play, handle potential errors (e.g., browser restrictions)
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        }
        setIsPlaying(!isPlaying); // Optimistically update state, actual state syncs via onPlay/onPause listeners
    };

    // Handle seeking using the range input
    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
        const newTime = parseFloat(event.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime); // Update state immediately for smoother UI
        }
    };

    // handles volume control
    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(event.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0); // Mute if volume is 0
        if (audioRef.current) {
          audioRef.current.volume = newVolume;
          audioRef.current.muted = newVolume === 0; // Also update the muted property
        }
      };


    // mutes the audio
    const toggleMute = () => {
        if (!audioRef.current) return;
        const currentlyMuted = !isMuted; // Target state
        setIsMuted(currentlyMuted);
        audioRef.current.muted = currentlyMuted;
  
        if (currentlyMuted) {
            previousVolumeRef.current = volume; // Store current volume
            setVolume(0); // Set slider/state to 0
        } else {
            // If unmuting and previous volume was 0, set to a default (e.g., 0.5)
            const volumeToRestore = previousVolumeRef.current > 0 ? previousVolumeRef.current : 0.5;
            setVolume(volumeToRestore);
            audioRef.current.volume = volumeToRestore;
        }
    };

// --- Effect for Loading New Track ---

useEffect(() => {
    setIsMetadataLoaded(false); // Reset metadata flag when track changes
    setIsPlaying(false); // Stop playback when track changes
    setCurrentTime(0); // Reset time
    setDuration(0); // Reset duration

    if (trackSrc && audioRef.current) {
      audioRef.current.src = trackSrc;
      audioRef.current.load(); // Important: Load the new source

      // Restore volume/mute state potentially stored
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;

        // Set the loop attribute based on the repeatMode prop

      // Attempt to play the track automatically
      const playPromise = audioRef.current.play();

      // handles autoplay
      if (playPromise !== undefined) {
        playPromise
        //   .then(_ => {
        //     // Autoplay started! The 'onPlay' event listener we added earlier
        //     // should automatically set the isPlaying state to true.
        //     console.log(`Autoplay successful for: ${trackSrc}`);
        //   })
          .catch(error => {
            // Autoplay was prevented by the browser.
            console.error(`Autoplay prevented for ${trackSrc}:`, error);
            // Ensure the UI reflects that it's not playing if autoplay fails
            setIsPlaying(false);
          });
      }

      // Set up event listeners for the audio element
      const audio = audioRef.current; // Capture current ref value
      audio.volume = volume;
      audio.muted = isMuted;
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleTrackEnd);
      // Listeners to sync isPlaying state more accurately
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('volumechange', () => {
        // Sync state if volume/mute changed externally (less common)
        if (audioRef.current) {
            setVolume(audioRef.current.volume);
            setIsMuted(audioRef.current.muted);
        }
    });


      // Cleanup function: remove listeners when component unmounts or trackSrc changes
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleTrackEnd);
        audio.removeEventListener('play', () => setIsPlaying(true));
        audio.removeEventListener('pause', () => setIsPlaying(false));
        audio.removeEventListener('volumechange', () => handleVolumeChange);
      };
    }
  }, [trackSrc]);// Add handlers as dependencies

  useEffect(() => {
    if (audioRef.current) {
      // Set the loop attribute based on the repeatMode prop
      audioRef.current.loop = (repeatMode === 'one');
    }
  }, [repeatMode]); // This effect ONLY runs when repeatMode changes
  
  if (!trackSrc) {
    return <div className="mt-4 p-4 text-center text-[var(--color-content-light)] ">Select a track to play</div>;
  }
  return (
    <div className="mt-4 p-4 rounded flex flex-wrap flex-col md:flex-row items-center gap-3 md:gap-4">
      {/* Audio element - hidden but necessary */}
      <audio ref={audioRef} preload="metadata"> {/* Preload metadata to get duration sooner */}
        Your browser does not support the audio element. ˙◠˙
      </audio>

    {/* --- Album Art Section --- */}
    <div className="flex-shrink-0 w-10 h-10 md:w-10 md:h-10 bg-gray-300 dark:bg-neutral-600 rounded overflow-hidden flex items-center justify-center">
        {albumArtSrc ? (
          <img
            src={albumArtSrc}
            alt={`Album art for ${trackTitle}`}
            className="w-full h-full object-cover" // Cover ensures image fills space
          />
        ) : (
          // Placeholder Icon if no album art
          <FaMusic className="text-2xl text-gray-500 dark:text-neutral-400" />
        )}
      </div>

      {/* --- Add Repeat Button --- */}
      <button
               onClick={onToggleRepeat}
               className={`p-2 text-lg rounded-full hover:bg-gray-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                 ${repeatMode !== 'none' ? 'text-mizu-dark dark:text-mizu-light' : 'text-neutral-500 dark:text-neutral-400'}
               `}
               aria-label={`Repeat mode: ${repeatMode}`}
               title={`Repeat mode: ${repeatMode}`}
               disabled={!isMetadataLoaded}
             >
               {repeatMode === 'one' ? <TbRepeatOnce /> : <FaRedo />}
             </button>

    {/* Main Controls Group (Prev, Play/Pause, Next) */}  
    <div className="flex items-center gap-3">
      {/* Previous Button */}
      <button
           onClick={onPlayPrevious}
           className="p-2 rounded-full bg-mizu-light dark:bg-mizu-dark text-white hover:opacity-85 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
           aria-label="Previous track"
           disabled={!hasPrevious || !isMetadataLoaded} // Disable if no previous or not ready
         >
           <FaStepBackward />
         </button>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className="p-2 rounded-full bg-mizu-light dark:bg-mizu-dark text-white hover:opacity-85 transition-opacity disabled:opacity-50"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        disabled={!isMetadataLoaded} // Disable button until duration is known
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      {/* Next Button */}
      <button
           onClick={onPlayNext}
           className="p-2 rounded-full bg-mizu-light dark:bg-mizu-dark text-white hover:opacity-85 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
           aria-label="Next track"
           disabled={!hasNext || !isMetadataLoaded} // Disable if no next or not ready
         >
           <FaStepForward />
         </button>
    </div>

    {/* Seek/Time Group */}
    <div className="flex items-center gap-2 flex-grow w-full md:w-auto">
      {/* Current Time */}
      <span className="text-sm text-neutral-700 dark:text-neutral-300 font-mono w-12 text-right">
        {formatTime(currentTime)}
      </span>

      {/* Seek Bar */}
      <input
        type="range"
        min="0"
        max={duration || 1} // Duration might be 0 initially
        step="0.1" // Allow finer seeking
        value={currentTime}
        onChange={handleSeek}
        className="flex-grow h-2 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-mizu-dark dark:accent-mizu-light disabled:opacity-50 disabled:cursor-not-allowed" // Basic styling + accent color
        disabled={!isMetadataLoaded || duration === 0} // Disable until ready
      />

      {/* Duration */}
      <span className="text-sm text-neutral-700 dark:text-neutral-300 font-mono w-12">
        {formatTime(duration)}
      </span>
    </div>

    {/* Volume Controls Group */}
    <div className="flex items-center gap-2">
          {/* Mute Toggle Button */}
           <button onClick={toggleMute} className="text-neutral-600 dark:text-neutral-300 hover:opacity-75 disabled:opacity-50" disabled={!isMetadataLoaded}>
               {isMuted ? <FaVolumeMute /> : volume > 0.5 ? <FaVolumeUp /> : volume > 0 ? <FaVolumeDown /> : <FaVolumeOff />}
           </button>
          {/* Volume Slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.02" // Finer steps for volume
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 md:w-20 h-1 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-mizu-dark dark:accent-mizu-light disabled:opacity-50 disabled:cursor-not-allowed" // Shorter slider for volume
            disabled={!isMetadataLoaded}
            aria-label="Volume"
          />
    </div>
    {/* --- Add Shuffle Button Placeholder (Add later) --- */}
    <button
               onClick={onToggleShuffle}
               className={`p-2 text-lg rounded-full hover:bg-gray-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                 ${isShuffled ? 'text-mizu-dark dark:text-mizu-light' : 'text-neutral-500 dark:text-neutral-400'}
               `}
               aria-label={`Shuffle: ${isShuffled ? 'On' : 'Off'}`}
               title={`Shuffle: ${isShuffled ? 'On' : 'Off'}`}
               disabled={!isMetadataLoaded} // Disable if player not ready
              >
                <FaRandom />
              </button>
    </div>
  );
};

export default MusicPlayer;