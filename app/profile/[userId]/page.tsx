import { redirect } from 'next/navigation'
import { getUserProfile } from '@/app/actions/get-user-profile'
import { getUserSessions } from '@/app/actions/get-user-sessions'
import Avatar from '@/components/Avatar'
import { FollowButton } from '@/components/FollowButton'
import { StatsSection } from '@/components/StatsSection'
import { UserSessionList } from '@/components/UserSessionList'

interface UserProfilePageProps {
  params: Promise<{
    userId: string
  }>
}

/**
 * User Profile Page
 *
 * Displays a readonly view of another user's profile with follow/unfollow functionality.
 * Redirects to /profile if viewing own profile.
 */
export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = await params
  const userProfile = await getUserProfile(userId)

  // Fetch user's sessions
  const initialSessions = userProfile ? await getUserSessions(userId, 0) : []

  // Handle user not found
  if (!userProfile || !userProfile.username) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 p-6 max-w-md mx-auto w-full flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">User Not Found</h1>
            <p className="text-foreground/60 mb-6">
              This user doesn't exist or has been removed.
            </p>
            <a
              href="/profile"
              className="inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Profile
            </a>
          </div>
        </main>
      </div>
    )
  }

  // Redirect if viewing own profile
  if (userProfile.is_own_profile) {
    redirect('/profile')
  }

  const memberSinceYear = new Date(userProfile.created_at).getFullYear()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-6 max-w-md mx-auto w-full flex flex-col gap-6">
        {/* Avatar Section (Readonly) */}
        <div className="flex flex-col items-center gap-3">
          {/* Avatar without onUpload prop = readonly mode */}
          <Avatar uid={userProfile.id} url={userProfile.avatar_url} size={120} />

          <div className="text-center">
            {/* Username */}
            <p className="text-lg text-foreground mb-1">@{userProfile.username}</p>

            {/* Member Since */}
            <p className="text-sm text-foreground/60">
              BBQ Buddy since {memberSinceYear}
            </p>

            {/* Follower Count */}
            <p className="text-sm text-foreground/60 mt-1">
              {userProfile.follower_count}{' '}
              {userProfile.follower_count === 1 ? 'follower' : 'followers'}
            </p>
          </div>

          {/* Follow/Unfollow Button */}
          <FollowButton
            userId={userProfile.id}
            initialIsFollowing={userProfile.is_following || false}
          />
        </div>

        {/* BBQ Statistics */}
        <StatsSection userId={userProfile.id} />

        {/* Session List - NEW */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            {userProfile.username}'s BBQ Sessions
          </h2>
          <UserSessionList
            initialSessions={initialSessions}
            userId={userProfile.id}
            readOnly={true}
          />
        </div>
      </main>
    </div>
  )
}
