// ==================== DraftManager Component ====================

import React, { useState, useEffect } from 'react'
import { Save, Trash2, Download, X } from 'lucide-react'

interface Draft {
  id: number
  name: string
  supplier: string
  docNumber: string
  docDate: string
  notes: string
  purchaseItems: any[]
  paidAmount: string
  createdAt: string
}

interface DraftManagerProps {
  isOpen: boolean
  onClose: () => void
  onLoadDraft: (draft: Draft) => void
  currentItems: any[]
  currentSupplier: string
  currentDocNumber: string
  currentDocDate: string
  currentNotes: string
  currentPaidAmount: string
}

export function DraftManager({
  isOpen,
  onClose,
  onLoadDraft,
  currentItems,
  currentSupplier,
  currentDocNumber,
  currentDocDate,
  currentNotes,
  currentPaidAmount
}: DraftManagerProps) {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [draftName, setDraftName] = useState('')

  // ==================== تحميل المسودات من localStorage ====================
  useEffect(() => {
    const saved = localStorage.getItem('purchase_drafts')
    if (saved) {
      try {
        setDrafts(JSON.parse(saved))
      } catch (error) {
        console.error('خطأ في تحميل المسودات:', error)
      }
    }
  }, [])

  // ==================== حفظ المسودة ====================
  const handleSaveDraft = () => {
    if (!draftName.trim()) {
      alert('❌ اكتب اسم للمسودة!')
      return
    }

    if (currentItems.length === 0) {
      alert('❌ ما في منتجات لحفظ!')
      return
    }

    const newDraft: Draft = {
      id: Date.now(),
      name: draftName,
      supplier: currentSupplier,
      docNumber: currentDocNumber,
      docDate: currentDocDate,
      notes: currentNotes,
      purchaseItems: currentItems,
      paidAmount: currentPaidAmount,
      createdAt: new Date().toISOString()
    }

    const updatedDrafts = [...drafts, newDraft]
    setDrafts(updatedDrafts)
    localStorage.setItem('purchase_drafts', JSON.stringify(updatedDrafts))

    setDraftName('')
    setShowSaveForm(false)
    alert('✅ تم حفظ المسودة!')
  }

  // ==================== حذف المسودة ====================
  const handleDeleteDraft = (draftId: number) => {
    if (window.confirm('هل أنت متأكد من الحذف؟')) {
      const updatedDrafts = drafts.filter(d => d.id !== draftId)
      setDrafts(updatedDrafts)
      localStorage.setItem('purchase_drafts', JSON.stringify(updatedDrafts))
    }
  }

  // ==================== تحميل المسودة ====================
  const handleLoadDraft = (draft: Draft) => {
    if (currentItems.length > 0) {
      if (!window.confirm('⚠️ هتحذف البيانات الحالية، متأكد؟')) {
        return
      }
    }
    onLoadDraft(draft)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">المسودات المحفوظة</h3>
                  <p className="text-text-secondary text-sm">الفواتير الغير مكتملة</p>
                </div>
          <button
            onClick={onClose}
            className="text-2xl hover:bg-purple-500 p-1 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Save Form */}
          {showSaveForm && (
            <div className="p-6 bg-purple-50 border-b-2 border-purple-300">
              <h4 className="font-bold text-gray-800 mb-3">💾 حفظ مسودة جديدة</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="اسم المسودة..."
                  className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors"
                >
                  حفظ
                </button>
                <button
                  onClick={() => setShowSaveForm(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-bold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Drafts List */}
          {drafts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">📭 ما في مسودات محفوظة بعد</p>
              {!showSaveForm && (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  انشئ مسودة أول
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {drafts.map(draft => (
                <div
                  key={draft.id}
                  className="p-5 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-800 mb-2">
                        {draft.name}
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">
                            <span className="font-semibold">المورد:</span> {draft.supplier || '—'}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">الوثيقة:</span> {draft.docNumber || 'تلقائي'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            <span className="font-semibold">المنتجات:</span>{' '}
                            <span className="text-blue-600 font-bold">{draft.purchaseItems.length}</span>
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">المجموع:</span>{' '}
                            <span className="text-green-600 font-bold">
                              {draft.purchaseItems
                                .reduce((sum: number, item: any) => sum + item.linetotal, 0)
                                .toFixed(2)}{' '}
                              دج
                            </span>
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        📅 {new Date(draft.createdAt).toLocaleString('ar-DZ')}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleLoadDraft(draft)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <Download className="w-4 h-4" />
                        تحميل
                      </button>
                      <button
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!showSaveForm && drafts.length > 0 && (
          <div className="bg-gray-50 border-t p-4">
            <button
              onClick={() => setShowSaveForm(true)}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              حفظ مسودة جديدة
            </button>
          </div>
        )}
      </div>
    </div>
  )
}