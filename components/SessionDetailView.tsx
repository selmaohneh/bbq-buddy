'use client'

import { useState } from 'react'
import { SessionWithProfile } from '@/types/session'
import Image from 'next/image'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import { WeatherTag } from '@/components/WeatherTag'
import { GrillTypeTag } from '@/components/GrillTypeTag'
import { MeatTypeTag } from '@/components/MeatTypeTag'
import { PeopleCountTag } from '@/components/PeopleCountTag'
import ImageLightbox from './ImageLightbox'

interface SessionDetailViewProps {
  session: SessionWithProfile
}

export function SessionDetailView({ session }: SessionDetailViewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Format Date: "Fri, Dec 18, 2025"
  const dateObj = new Date(session.date)
  const dateString = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleImageClick = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-6 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to Feed
        </Link>

        {/* User Header */}
        <div className="flex items-center gap-3 mb-6">
          <Avatar uid={session.user_id} url={session.avatar_url} size={48} />
          <div>
            <Link
              href={`/profile/${session.user_id}`}
              className="font-semibold text-lg hover:text-primary transition-colors"
            >
              @{session.username}
            </Link>
            <div className="text-sm text-foreground/60">{dateString}</div>
          </div>
        </div>

        {/* Session Title */}
        <h1 className="text-3xl font-bold mb-6">{session.title}</h1>

        {/* Image Gallery */}
        {session.images && session.images.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.images.map((image, idx) => (
              <div
                key={idx}
                onClick={() => handleImageClick(idx)}
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Image
                  src={image}
                  alt={`${session.title} - Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* Session Details */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Details</h2>

          <div className="space-y-4">
            {/* People Count */}
            <div className="flex items-center gap-2">
              <span className="text-foreground/60 font-medium">People Fed:</span>
              <PeopleCountTag count={session.number_of_people} />
            </div>

            {/* Meal Time */}
            {session.meal_time && (
              <div className="flex items-center gap-2">
                <span className="text-foreground/60 font-medium">Meal Time:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                  {session.meal_time}
                </span>
              </div>
            )}

            {/* Weather */}
            {session.weather_types && session.weather_types.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-foreground/60 font-medium">Weather:</span>
                <div className="flex flex-wrap gap-2">
                  {session.weather_types.map((weather) => (
                    <WeatherTag
                      key={weather}
                      weather={weather}
                      size="md"
                      showText={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Grill Types */}
            {session.grill_types && session.grill_types.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-foreground/60 font-medium">Grill Type:</span>
                <div className="flex flex-wrap gap-2">
                  {session.grill_types.map((type) => (
                    <GrillTypeTag key={type} type={type} size="md" showText={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Meat Types */}
            {session.meat_types && session.meat_types.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-foreground/60 font-medium">Food Type:</span>
                <div className="flex flex-wrap gap-2">
                  {session.meat_types.map((type) => (
                    <MeatTypeTag key={type} type={type} size="md" showText={true} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {session.notes && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <p className="whitespace-pre-wrap text-foreground/80">{session.notes}</p>
          </div>
        )}

        {/* Action: View Profile */}
        <div className="mt-8 flex justify-center">
          <Link
            href={`/profile/${session.user_id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            View {session.username}'s Profile
          </Link>
        </div>
      </div>

      {/* Image Lightbox */}
      {session.images && session.images.length > 0 && (
        <ImageLightbox
          images={session.images}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
