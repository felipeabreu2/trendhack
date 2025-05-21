"use client"

import dynamic from "next/dynamic"
import React from "react"

const VideoRealtime = dynamic(() => import("@/components/video-realtime"), { ssr: false })

interface VideoRealtimeWrapperProps {
  videoId: string;
  videoAgentId: string;
  analysisStatus: string;
  analysisContent: string;
  simplifiedStatus: string;
  simplifiedContent: string;
  replyStatus: string;
  replyContent: string;
}

export default function VideoRealtimeWrapper(props: VideoRealtimeWrapperProps) {
  return <VideoRealtime {...props} />
} 