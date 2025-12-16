import { defineStore } from 'pinia'
import { ref } from 'vue'
import { addCartItem, deleteAllCartItems, deleteCartItem, deleteSelectCartItems, getCart, getRecommendCartItems } from '@/api/cart'

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

  const addItemToCart = async (productCode) => {
    const data = await addCartItem(productCode)
    if (data.success) {
      await getCartInfo()
    }
  }
  
  const deleteCartItemOne = async (productCode) => {
    try {
        await deleteCartItem(productCode)
        delete cartItems.value[productCode]
        count.value--
    } catch (error) {
        console.error('장바구니 상품 삭제 실패:', error)
    }
  }

  const deleteCartItemsSel = async (productCodes) => {
    try {
        await deleteSelectCartItems(productCodes)
        productCodes.forEach((productCode) => {
            delete cartItems.value[productCode]
        })
        count.value -= productCodes.length
    } catch (error) {
        console.error('장바구니 상품 삭제 실패:', error)
    }
  }

  const deleteCartItemsAll = async () => {
    try {
        await deleteAllCartItems()
        cartItems.value = {}
        count.value = 0
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
    addItemToCart,
    deleteCartItemOne,
    deleteCartItemsSel,
    deleteCartItemsAll
  }
})
