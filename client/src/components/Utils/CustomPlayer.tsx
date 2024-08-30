"use client"
import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface CustomPlayerProps {
  url: string;
}

const CustomPlayer: React.FC<CustomPlayerProps> = ({ url }) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [muted, setMuted] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <Card ref={containerRef} className="relative group overflow-hidden">
      <CardContent className="p-0">
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          muted={muted}
          className="react-player"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePlayPause} className="text-white hover:text-blue-500">
              {playing ? <Pause size={24} /> : <Play size={24} />}
            </Button>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={handleToggleMute} className="text-white hover:text-blue-500">
                {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </Button>
              <Slider
                className="w-24"
                min={0}
                max={1}
                step={0.01}
                value={[volume]}
                onValueChange={handleVolumeChange}
              />
              <Button variant="ghost" size="icon" onClick={handleToggleFullscreen} className="text-white hover:text-blue-500">
                {fullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomPlayer;