import { useState, useCallback } from 'react'
import { AccessoryWithDetails, PhoneWithDetails } from '@/lib/types'
import { ProductModalMode } from '@/components/modal/BaseProductModal'

interface ModalState {
  isOpen: boolean
  mode: ProductModalMode
  product: AccessoryWithDetails | PhoneWithDetails | null
  productType: 'phone' | 'accessory'
}

/**
 * 🎣 Hook لإدارة حالة الـ Modals بسهولة
 *
 * الاستخدام:
 * const { modal, openAdd, openEdit, openCount, close } = useInventoryModal()
 *
 * // فتح modal إضافة
 * <button onClick={openAdd}>إضافة</button>
 *
 * // فتح modal تعديل
 * <button onClick={() => openEdit(product)}>تعديل</button>
 *
 * // فتح modal جرد
 * <button onClick={() => openCount(product)}>جرد</button>
 *
 * // عرض الـ Modal
 * <BaseProductModal
 *   isOpen={modal.isOpen}
 *   mode={modal.mode}
 *   product={modal.product}
 *   productType={modal.productType}
 *   onSubmit={handleSubmit}
 *   onClose={close}
 * />
 */

export function useInventoryModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'add',
    product: null,
    productType: 'accessory',
  })

  const openAdd = useCallback((productType: 'phone' | 'accessory' = 'accessory') => {
    setModalState({
      isOpen: true,
      mode: 'add',
      product: null,
      productType,
    })
  }, [])

  const openEdit = useCallback(
    (product: AccessoryWithDetails | PhoneWithDetails, productType: 'phone' | 'accessory') => {
      setModalState({
        isOpen: true,
        mode: 'edit',
        product,
        productType,
      })
    },
    []
  )

  const openCount = useCallback(
    (product: AccessoryWithDetails | PhoneWithDetails, productType: 'phone' | 'accessory') => {
      setModalState({
        isOpen: true,
        mode: 'count',
        product,
        productType,
      })
    },
    []
  )

  const openManual = useCallback((productType: 'phone' | 'accessory' = 'accessory') => {
    setModalState({
      isOpen: true,
      mode: 'manual',
      product: null,
      productType,
    })
  }, [])

  const close = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }, [])

  return {
    modal: modalState,
    openAdd,
    openEdit,
    openCount,
    openManual,
    close,
  }
}