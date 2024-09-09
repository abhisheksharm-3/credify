import React from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Content } from '@/lib/types'

interface ContentDetailsSheetProps {
  content: Content | null
  isEditing: boolean
  onClose: () => void
  onEdit: () => void
  onSave: (updatedContent: Content) => void
}

export default function ContentDetailsSheet({
  content,
  isEditing,
  onClose,
  onEdit,
  onSave
}: ContentDetailsSheetProps) {
  const [editedContent, setEditedContent] = React.useState<Content | null>(null)

  React.useEffect(() => {
    setEditedContent(content)
  }, [content])

  if (!content) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedContent((prev: Content | null) => prev ? { ...prev, [name]: value } : null)
  }

  const handleSelectChange = (name: string, value: string) => {
    setEditedContent((prev: Content | null) => prev ? { ...prev, [name]: value } : null)
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
          <SheetTitle>{isEditing ? 'Edit Content' : 'Content Details'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Make changes to your content here.' : 'View detailed information about your content.'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={editedContent?.title || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={isEditing ? '' : 'bg-muted'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={editedContent?.description || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={isEditing ? '' : 'bg-muted'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={editedContent?.type || ''}
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            {isEditing ? (
              <Select
                value={editedContent?.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="status"
                value={editedContent?.status || ''}
                readOnly
                className="bg-muted"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="creator">Creator</Label>
            <Input
              id="creator"
              value={editedContent?.creator || ''}
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uploadDate">Upload Date</Label>
            <Input
              id="uploadDate"
              value={editedContent?.uploadDate || ''}
              readOnly
              className="bg-muted"
            />
          </div>
          {editedContent?.type === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                name="duration"
                value={editedContent?.duration || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={isEditing ? '' : 'bg-muted'}
              />
            </div>
          )}
          {editedContent?.type === 'image' && (
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                name="dimensions"
                value={editedContent?.dimensions || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={isEditing ? '' : 'bg-muted'}
              />
            </div>
          )}
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