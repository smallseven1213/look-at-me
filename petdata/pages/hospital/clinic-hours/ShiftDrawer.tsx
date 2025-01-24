import { useEffect, useState } from 'react'
import Button from '../../../components/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/Dialog'
import Input from '../../../components/Input'
import LabelText from '../../../components/LabelText'
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog'

type ShiftDrawerProps = {
  visible: boolean
  onClose: () => void
  shiftData: any
  onSave: (data: any) => void
  onDelete: (id: string) => void
}

const ShiftDrawer = ({ visible, onClose, shiftData, onSave, onDelete }: ShiftDrawerProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [name, setName] = useState(shiftData?.name || '')

  useEffect(() => {
    if (shiftData) {
      setName(shiftData.name || '')
      // Update other state variables if you have more fields
    } else {
      // Reset state variables when shiftData is null or undefined
      setName('')
      // Reset other state variables
    }
  }, [shiftData])

  useEffect(() => {
    if (!visible) {
      // Reset state variables when drawer is closed
      setName('')
      // Reset other state variables
    }
  }, [visible])

  const handleSave = () => {
    onSave({ ...shiftData, name })
    onClose()
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    onDelete(shiftData.id)
    setShowDeleteDialog(false)
    onClose()
  }

  if (!shiftData) {
    return null
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform z-50 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex-none flex items-center justify-between p-4 border-b border-gray-200">
            <div className="text-lg font-bold">編輯班次</div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <Input label="班次名稱" value={name} onChange={e => setName(e.target.value)} />

            <LabelText label="時間" text={`${shiftData?.startTime} - ${shiftData?.endTime}`} />
          </div>

          <div className="flex-none p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <Button variant="delete" onClick={handleDelete} className="w-24">
                刪除
              </Button>
              <div className="space-x-2">
                <Button variant="tertiary" onClick={onClose} className="w-24">
                  取消
                </Button>
                <Button variant="primary" onClick={handleSave} className="w-24">
                  儲存
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        description="確定要刪除這個班次嗎？此操作無法復原。"
      />
    </>
  )
}

export default ShiftDrawer
