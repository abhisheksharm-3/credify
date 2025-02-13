import React from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from '@/lib/types'
import { formatDate, handleNavigation } from '@/lib/frontend-function'

interface RenderUserHierarchyProps {
  user: User
  isRoot?: boolean
  copyrightUserId?: string
}

const renderUserHierarchy = ({ user, isRoot = true, copyrightUserId }: RenderUserHierarchyProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex flex-col py-2 w-full ${isRoot ? 'items-center' : 'items-start'}`}
  >
    <div className={`flex ${isRoot ? 'flex-col items-center' : 'flex-row items-center'} mb-2`}>
      <Avatar className={`h-8 w-8 md:h-10 md:w-10 mb-1 mr-2 ${copyrightUserId === user.userId ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-background' : ''}`}>
        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <button
          onClick={() => handleNavigation(user.userId)}
          className={`text-sm md:text-base font-medium cursor-pointer hover:underline ${
            isRoot ? 'text-center' : 'text-left'
          } bg-transparent border-0`}
        >
          {user.name}
          {copyrightUserId === user.userId && ' (Copyright Owner)'}
        </button>
        <p className={`text-xs md:text-sm text-muted-foreground ${isRoot ? 'text-center' : 'text-left'}`}>
          {user.dateOfUpload ? formatDate(new Date(user.dateOfUpload).toLocaleString()) : "Unknown Date"}
        </p>
      </div>
    </div>
    {user.children.length > 0 && (
      <div className="w-full pl-4">
        <div className="space-y-2">
          {user.children.map((child, index) => (
            <div key={index} className="w-full">
              {renderUserHierarchy({ user: child, isRoot: false, copyrightUserId })}
            </div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
)

export default renderUserHierarchy