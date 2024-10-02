import { UserX, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function UserNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <UserX className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" aria-hidden="true" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We couldn't find the user you're looking for. They may have been removed or you might have mistyped the address.
        </p>
        <Link href="/" passHref>
          <Button className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            <Home className="mr-2 h-5 w-5" aria-hidden="true" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}