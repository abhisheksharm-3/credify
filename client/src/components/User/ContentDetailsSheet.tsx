import React from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileInfo } from '@/lib/types'

interface ContentDetailsSheetProps {
  content: FileInfo | null
  isEditing: boolean
  onClose: () => void
  onEdit: () => void
  onSave: (updatedContent: FileInfo) => void
}

export default function ContentDetailsSheet({
  content,
  isEditing,
  onClose,
  onEdit,
  onSave
}: ContentDetailsSheetProps) {
  const [editedContent, setEditedContent] = React.useState<FileInfo | null>(null)

  React.useEffect(() => {
    setEditedContent(content)
  }, [content])

  if (!content) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedContent((prev: FileInfo | null) => prev ? { ...prev, [name]: value } : null)
  }

  const handleSelectChange = (name: string, value: string) => {
    setEditedContent((prev: FileInfo | null) => prev ? { ...prev, [name]: value } : null)
  }

  const handleSave = () => {
    if (editedContent) {
      onSave(editedContent)
    }
  }

  return (
    <Sheet open={!!content} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[540px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit File Information' : 'File Details'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Make changes to your file information here.' : 'View detailed information about your file.'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              name="fileName"
              value={editedContent?.fileName || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={isEditing ? '' : 'bg-muted'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fileSize">File Size</Label>
            <Input
              id="fileSize"
              name="fileSize"
              value={editedContent?.fileSize || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={isEditing ? '' : 'bg-muted'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fileType">File Type</Label>
            <Input
              id="fileType"
              name="fileType"
              value={editedContent?.fileType || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={isEditing ? '' : 'bg-muted'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fileUrl">File URL</Label>
            <Input
              id="fileUrl"
              name="fileUrl"
              value={editedContent?.fileUrl || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={isEditing ? '' : 'bg-muted'}
            />
          </div>
          {/* Add any additional fields if needed */}
        </div>
        <SheetFooter className="mt-6">
          {isEditing ? (
            <>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>Save changes</Button>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </>
          ) : (
            <Button type="button" onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
              Edit
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
