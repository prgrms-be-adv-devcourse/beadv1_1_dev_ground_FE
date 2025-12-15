import { defineStore } from 'pinia'
import { ref } from 'vue'
import { deleteAllCartItems, deleteCartItem, deleteSelectCartItems, getCart, getRecommendCartItems } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const count = ref(0)
  const cartItems = ref({})
  const recommendCartItems = ref([])
  
  // 장바구니 조회
  const getCartInfo = async () => {
    try {
      const data = await getCart()
      count.value = data.cartItemInfos.length
      cartItems.value = data.cartItemInfos.reduce((acc, item) => {
        acc[item.productCode] = item
        return acc
      }, {})
    } catch (error) {
      console.error('장바구니 조회 실패:', error)
    }
  }

  const getRecommendProductsByCartItems = async () => {
    try {
        const data = await getRecommendCartItems()
        recommendCartItems.value = data
    } catch (error) {
        console.error('장바구니 추천 상품 조회 실패:', error)
    }
  }
  
  const deleteCartItemOne = async (productCode) => {
    try {
        const data = await deleteCartItem(productCode)
        if (data.success) {
            delete cartItems.value[productCode]
            count.value--
        }
    } catch (error) {
        console.error('장바구니 상품 삭제 실패:', error)
    }
  }

  const deleteCartItemsSel = async (productCodes) => {
    try {
        const data = await deleteSelectCartItems(productCodes)
        if (data.success) {
            productCodes.forEach((productCode) => {
                delete cartItems.value[productCode]
            })
            count.value -= productCodes.length
        }
    } catch (error) {
        console.error('장바구니 상품 삭제 실패:', error)
    }
  }

  const deleteCartItemsAll = async () => {
    try {
        const data = await deleteAllCartItems()
        if (data.success) {
            cartItems.value = {}
            count.value = 0
        }
    } catch (error) {
        console.error('장바구니 상품 삭제 실패:', error)
    }
  }
  
  return { 
    count, 
    cartItems,
    recommendCartItems,
    getCartInfo,
    getRecommendProductsByCartItems,
    deleteCartItemOne,
    deleteCartItemsSel,
    deleteCartItemsAll
  }
})
