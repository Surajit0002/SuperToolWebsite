import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformChartProps {
  audioUrl?: string;
  onReady?: (wavesurfer: WaveSurfer) => void;
  onRegionUpdate?: (start: number, end: number) => void;
  height?: number;
  className?: string;
}

export default function WaveformChart({
  audioUrl,
  onReady,
  onRegionUpdate,
  height = 100,
  className = ""
}: WaveformChartProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize WaveSurfer
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#3b82f6',
      progressColor: '#1d4ed8',
      cursorColor: '#ef4444',
      barWidth: 2,
      barRadius: 1,
      height: height,
      normalize: true,
      mediaControls: false,
    });

    // Load audio when URL is provided
    if (audioUrl) {
      wavesurfer.current.load(audioUrl);
    }

    // Notify parent component when ready
    wavesurfer.current.on('ready', () => {
      if (onReady && wavesurfer.current) {
        onReady(wavesurfer.current);
      }
    });

    // Handle region updates
    if (onRegionUpdate) {
      wavesurfer.current.on('interaction', () => {
        const currentTime = wavesurfer.current?.getCurrentTime() || 0;
        const duration = wavesurfer.current?.getDuration() || 0;
        onRegionUpdate(currentTime, duration);
      });
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, []);

  // Update audio source
  useEffect(() => {
    if (wavesurfer.current && audioUrl) {
      wavesurfer.current.load(audioUrl);
    }
  }, [audioUrl]);

  return (
    <div className={`w-full ${className}`}>
      <div 
        ref={waveformRef} 
        className="w-full border border-gray-200 rounded-lg"
        data-testid="waveform-chart"
      />
    </div>
  );
}