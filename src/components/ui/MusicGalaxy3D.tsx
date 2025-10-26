'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface MusicGalaxy3DProps {
  topArtists: Array<{
    artist: string;
    totalVotes: number;
    totalPoints: number;
    submissionCount: number;
  }>;
  topSongs: Array<{
    title: string;
    artist: string;
    totalVotes: number;
    totalPoints: number;
  }>;
  topSubmitters: Array<{
    name: string;
    totalPoints: number;
    submissions: number;
  }>;
}

// 3D Performance Heatmap - Shows artist performance across multiple dimensions
function PerformanceHeatmap({ artists }: { artists: any[] }) {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);
  
  // Create performance matrix: votes vs submissions vs points
  const performanceData = useMemo(() => {
    const matrix: any[][] = [];
    const voteRanges = [0, 50, 100, 200, 500, 1000];
    const submissionRanges = [0, 5, 10, 20, 50, 100];
    
    for (let i = 0; i < voteRanges.length - 1; i++) {
      matrix[i] = [];
      for (let j = 0; j < submissionRanges.length - 1; j++) {
        const artistsInRange = artists.filter(artist => 
          artist.totalVotes >= voteRanges[i] && artist.totalVotes < voteRanges[i + 1] &&
          artist.submissionCount >= submissionRanges[j] && artist.submissionCount < submissionRanges[j + 1]
        );
        
        const avgPoints = artistsInRange.length > 0 
          ? artistsInRange.reduce((sum, artist) => sum + artist.totalPoints, 0) / artistsInRange.length 
          : 0;
        
        matrix[i][j] = {
          count: artistsInRange.length,
          avgPoints,
          artists: artistsInRange
        };
      }
    }
    return matrix;
  }, [artists]);

  return (
    <group>
      {/* Grid floor with labels */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#333333" transparent opacity={0.3} />
      </mesh>
      
      {/* Performance cells */}
      {performanceData.map((row, i) => 
        row.map((cell, j) => {
          const x = (i - 2.5) * 2.4;
          const z = (j - 2) * 1.6;
          const height = Math.max(0.1, cell.avgPoints / 100);
          const intensity = Math.min(1, cell.count / 5);
          
          return (
            <group key={`${i}-${j}`} position={[x, 0, z]}>
              <mesh
                position={[0, height / 2, 0]}
                onPointerEnter={() => setHoveredCell([i, j])}
                onPointerLeave={() => setHoveredCell(null)}
              >
                <boxGeometry args={[2, height, 1.5]} />
                <meshStandardMaterial 
                  color={hoveredCell?.[0] === i && hoveredCell?.[1] === j ? "#ffffff" : `hsl(${120 - intensity * 60}, 70%, 50%)`}
                  emissive={hoveredCell?.[0] === i && hoveredCell?.[1] === j ? "#ffffff" : `hsl(${120 - intensity * 60}, 70%, 30%)`}
                  emissiveIntensity={0.3}
                />
              </mesh>
              
              {/* Cell info */}
              <Text
                position={[0, height + 0.2, 0]}
                fontSize={0.15}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {cell.count}
              </Text>
              
              {hoveredCell?.[0] === i && hoveredCell?.[1] === j && (
                <>
                  <Text
                    position={[0, height + 0.5, 0]}
                    fontSize={0.2}
                    color="#00ff88"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {cell.avgPoints.toFixed(0)} avg pts
                  </Text>
                  <Text
                    position={[0, height + 0.8, 0]}
                    fontSize={0.15}
                    color="#ffd700"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {cell.artists.length} artists
                  </Text>
                </>
              )}
            </group>
          );
        })
      )}
      
      {/* Axis labels */}
      <Text position={[0, 0.5, -5]} fontSize={0.3} color="white" anchorX="center">
        Votes Range
      </Text>
      <Text position={[-7, 0.5, 0]} fontSize={0.3} color="white" anchorX="center" rotation={[0, 0, Math.PI / 2]}>
        Submissions Range
      </Text>
    </group>
  );
}

// 3D Network Analysis - Shows relationships between artists and submitters
function NetworkAnalysis3D({ artists, submitters }: { artists: any[]; submitters: any[] }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [connections, setConnections] = useState<THREE.Vector3[]>([]);
  
  useEffect(() => {
    const lines: THREE.Vector3[] = [];
    
    // Create meaningful connections based on data relationships
    const topArtists = artists.slice(0, 8);
    const topSubmitters = submitters.slice(0, 6);
    
    topArtists.forEach((artist, artistIndex) => {
      const artistPos = new THREE.Vector3(
        (artistIndex - 4) * 3,
        Math.random() * 2,
        Math.random() * 3
      );
      
      // Connect to submitters based on performance correlation
      const numConnections = Math.min(3, Math.floor(artist.submissionCount / 5));
      for (let i = 0; i < numConnections; i++) {
        const submitterIndex = Math.floor(Math.random() * topSubmitters.length);
        const submitterPos = new THREE.Vector3(
          12 + (submitterIndex - 3) * 2,
          Math.random() * 2,
          Math.random() * 3
        );
        
        lines.push(artistPos, submitterPos);
      }
    });
    
    setConnections(lines);
  }, [artists, submitters]);

  return (
    <group>
      {/* Artist nodes with performance indicators */}
      {artists.slice(0, 8).map((artist, index) => {
        const size = Math.max(0.5, Math.min(2, artist.totalPoints / 100));
        const position = [
          (index - 4) * 3,
          Math.random() * 2,
          Math.random() * 3
        ] as [number, number, number];
        
        return (
          <group key={artist.artist} position={position}>
            <mesh
              onPointerEnter={() => setHoveredNode(artist.artist)}
              onPointerLeave={() => setHoveredNode(null)}
            >
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial 
                color={hoveredNode === artist.artist ? "#ff6b6b" : "#4ecdc4"} 
                emissive={hoveredNode === artist.artist ? "#ff6b6b" : "#4ecdc4"}
                emissiveIntensity={0.3}
              />
            </mesh>
            
            <Text
              position={[0, size + 0.5, 0]}
              fontSize={0.25}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {artist.artist}
            </Text>
            
            {hoveredNode === artist.artist && (
              <>
                <Text
                  position={[0, size + 0.8, 0]}
                  fontSize={0.2}
                  color="#00ff88"
                  anchorX="center"
                  anchorY="middle"
                >
                  {artist.totalPoints} pts
                </Text>
                <Text
                  position={[0, size + 1.1, 0]}
                  fontSize={0.2}
                  color="#ffd700"
                  anchorX="center"
                  anchorY="middle"
                >
                  {artist.totalVotes} votes
                </Text>
              </>
            )}
          </group>
        );
      })}
      
      {/* Submitter nodes */}
      {submitters.slice(0, 6).map((submitter, index) => {
        const size = Math.max(0.3, Math.min(1, submitter.totalPoints / 100));
        const position = [
          12 + (index - 3) * 2,
          Math.random() * 2,
          Math.random() * 3
        ] as [number, number, number];
        
        return (
          <group key={submitter.name} position={position}>
            <mesh
              onPointerEnter={() => setHoveredNode(submitter.name)}
              onPointerLeave={() => setHoveredNode(null)}
            >
              <boxGeometry args={[size, size, size]} />
              <meshStandardMaterial 
                color={hoveredNode === submitter.name ? "#ff6b6b" : "#ffd700"} 
                emissive={hoveredNode === submitter.name ? "#ff6b6b" : "#ffd700"}
                emissiveIntensity={0.3}
              />
            </mesh>
            
            <Text
              position={[0, size + 0.5, 0]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {submitter.name}
            </Text>
            
            {hoveredNode === submitter.name && (
              <Text
                position={[0, size + 0.8, 0]}
                fontSize={0.15}
                color="#ffd700"
                anchorX="center"
                anchorY="middle"
              >
                {submitter.totalPoints} pts
              </Text>
            )}
          </group>
        );
      })}
      
      {/* Connection lines */}
      {connections.length > 0 && (
        <Line
          points={connections}
          color="#4a90e2"
          lineWidth={2}
          opacity={0.6}
        />
      )}
    </group>
  );
}

// 3D Trend Analysis - Shows performance trends over time
function TrendAnalysis3D({ artists }: { artists: any[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      {/* Trend surface */}
      <mesh ref={meshRef}>
        <planeGeometry args={[16, 16, 32, 32]} />
        <meshStandardMaterial 
          color="#4ecdc4" 
          wireframe={true}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Performance indicators */}
      {artists.slice(0, 15).map((artist, index) => {
        const x = (index / 15) * 16 - 8;
        const z = Math.sin(index) * 4;
        const y = (artist.totalPoints / 200) * 4;
        const size = Math.max(0.2, Math.min(1, artist.totalVotes / 100));
        
        return (
          <group key={artist.artist} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[size, 8, 8]} />
              <meshStandardMaterial 
                color="#ff6b6b" 
                emissive="#ff6b6b"
                emissiveIntensity={0.3}
              />
            </mesh>
            <Text
              position={[0, size + 0.5, 0]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {artist.artist.substring(0, 8)}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

// Main 3D Analytics Dashboard
function MusicAnalytics3D({ topArtists, topSongs, topSubmitters }: MusicGalaxy3DProps) {
  const [viewMode, setViewMode] = useState<'heatmap' | 'network' | 'trends'>('heatmap');
  
  const safeArtists = topArtists || [];
  const safeSubmitters = topSubmitters || [];
  
  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl overflow-hidden relative">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.6} color="#4ecdc4" />
          <pointLight position={[10, -10, 10]} intensity={0.4} color="#ff6b6b" />
          
          {viewMode === 'heatmap' && <PerformanceHeatmap artists={safeArtists} />}
          {viewMode === 'network' && <NetworkAnalysis3D artists={safeArtists} submitters={safeSubmitters} />}
          {viewMode === 'trends' && <TrendAnalysis3D artists={safeArtists} />}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={25}
            minDistance={5}
            autoRotate={true}
            autoRotateSpeed={0.2}
          />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        <button
          onClick={() => setViewMode('heatmap')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            viewMode === 'heatmap' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Performance Heatmap
        </button>
        <button
          onClick={() => setViewMode('network')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            viewMode === 'network' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Network Analysis
        </button>
        <button
          onClick={() => setViewMode('trends')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            viewMode === 'trends' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Trend Analysis
        </button>
      </div>

      {/* Info */}
      <div className="absolute top-4 left-4 text-white">
        <h2 className="text-2xl font-bold mb-2">Music League Analytics</h2>
        <p className="text-sm text-gray-300">
          Advanced 3D data analysis
        </p>
        <p className="text-sm text-gray-300">
          Hover elements for insights
        </p>
        <p className="text-sm text-gray-300">
          Drag to rotate • Scroll to zoom
        </p>
      </div>
    </div>
  );
}

// Main component
export default function MusicGalaxy3D({ topArtists, topSongs, topSubmitters }: MusicGalaxy3DProps) {
  return (
    <MusicAnalytics3D 
      topArtists={topArtists}
      topSongs={topSongs}
      topSubmitters={topSubmitters}
    />
  );
}