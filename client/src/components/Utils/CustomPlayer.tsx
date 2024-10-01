"use client"
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings, PictureInPicture } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils";
import { CustomPlayerProps } from '@/lib/frontend-types';

const CustomPlayer: React.FC<CustomPlayerProps> = ({ url }) => {

  const [playing, setPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [muted, setMuted] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handlePlayPause = () => setPlaying(!playing);
  const handleVolumeChange = (value: number[]) => setVolume(value[0]);
  const handleToggleMute = () => setMuted(!muted);
  
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    setProgress(state.played * 100);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSeek = (value: number[]) => {
    setProgress(value[0]);
    playerRef.current?.seekTo(value[0] / 100);
  };

  const handleSkip = (seconds: number) => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(currentTime + seconds);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        const video = containerRef.current?.querySelector('video');
        if (video) {
          await video.requestPictureInPicture();
        }
      }
    } catch (error) {
      console.error('Failed to enter/exit picture-in-picture mode:', error);
    }
  };

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    containerRef.current?.addEventListener('mousemove', handleMouseMove);
    return () => {
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  return (
    <Card ref={containerRef} className="relative group overflow-hidden rounded-lg shadow-2xl">
      <CardContent className="p-0">
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          onProgress={handleProgress}
          onDuration={handleDuration}
          className="react-player"
        />
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
            >
              <Slider
                className="w-full mb-4"
                min={0}
                max={100}
                step={0.1}
                value={[progress]}
                onValueChange={handleSeek}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={handlePlayPause} className="text-white hover:text-primary">
                    {playing ? <Pause size={20} /> : <Play size={20} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleSkip(-10)} className="text-white hover:text-primary">
                    <SkipBack size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleSkip(10)} className="text-white hover:text-primary">
                    <SkipForward size={20} />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={handleToggleMute} className="text-white hover:text-primary">
                      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </Button>
                    <Slider
                      className="w-20"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                  <span className="text-white text-sm">
                    {formatTime(playerRef.current?.getCurrentTime() || 0)} / {formatTime(duration)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                        <Settings size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handlePlaybackRateChange(0.5)}>0.5x</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePlaybackRateChange(1)}>1x</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePlaybackRateChange(1.5)}>1.5x</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePlaybackRateChange(2)}>2x</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" onClick={togglePictureInPicture} className="text-white hover:text-primary">
                    <PictureInPicture size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleToggleFullscreen} className="text-white hover:text-primary">
                    {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default CustomPlayer;