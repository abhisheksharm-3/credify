import React from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight } from "lucide-react"
import { User } from '@/lib/types'
import { formatDate, handleNavigation } from '@/lib/frontend-function'

const renderUserHierarchy = (user: User, isRoot = true) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex flex-col py-2  w-full ${isRoot ? 'items-center' : 'items-start'}`}
  >
    <div className={`flex ${isRoot ? 'flex-col items-center' : 'flex-row items-center'} mb-2`}>
      <Avatar className="h-8 w-8 md:h-10 md:w-10 mb-1 mr-2">
        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p
          onClick={() => handleNavigation(user.userId)}
          className={`text-sm md:text-base font-medium cursor-pointer hover:underline ${isRoot ? 'text-center' : 'text-left'}`}
        >
          {user.name}
        </p>
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
              {renderUserHierarchy(child, false)}
            </div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
)

export default renderUserHierarchy