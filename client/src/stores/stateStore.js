import { defineStore } from 'pinia'

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useState = defineStore('state', {
  state: () => {
    return {
      scanning: false,
      connected: false,
      reading: true,
    }
  }
})