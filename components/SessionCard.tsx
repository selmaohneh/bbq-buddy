import { Session } from '@/types/session'
import Image from 'next/image'
import Link from 'next/link'
import { WeatherTag } from '@/components/WeatherTag'
import { PeopleCountTag } from '@/components/PeopleCountTag'

interface SessionCardProps {
  session: Session
}

export function SessionCard({ session }: SessionCardProps) {
  const mainImage = session.images?.[0]
  const additionalImagesCount = (session.images?.length || 0) - 1

  // Format Date: "Fri, Dec 18, 2025"
  const dateObj = new Date(session.date)
  const dateString = dateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link 
        href={`/sessions/${session.id}/edit`}
        className="group relative flex flex-col sm:flex-row bg-card text-card-foreground border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden block"
    >
        {/* Link covers the whole card for better UX */}
        {/* We can add a detailed view later, for now it's just a visual list item */}
        
      {/* Image Section */}
      <div className="relative w-full sm:w-40 h-48 sm:h-auto shrink-0 bg-foreground/5">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={session.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 160px"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-foreground/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {/* Multiple Images Indicator */}
        {additionalImagesCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
            +{additionalImagesCount}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-4 gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight">
            {session.title}
            </h3>
        </div>
        
        <div className="text-sm text-foreground/60 font-medium flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-70">
              <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
            </svg>
            <time>{dateString}</time>
          </span>
          <span className="opacity-50">-</span>
          <PeopleCountTag count={session.number_of_people} />
        </div>

        {/* Tags area */}
        {(session.meal_time || (session.weather_types && session.weather_types.length > 0)) && (
          <div className="mt-auto pt-2 flex flex-wrap gap-2">
            {/* Meal Time Tag */}
            {session.meal_time && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                {session.meal_time}
              </span>
            )}

            {/* Weather Tags */}
            {session.weather_types?.map((weather) => (
              <WeatherTag key={weather} weather={weather} size="sm" />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
