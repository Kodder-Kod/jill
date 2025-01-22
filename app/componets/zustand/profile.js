import { create } from 'zustand'


export const useUserID = create((set) => ({
    userID: '',
  }))
  
  
  export const useUserName = create((set) => ({
    userName: '',
  }))
  
  
  export const useUserEmail = create((set) => ({
    userEmail: '',
  }))

  
export const useUserPhone = create((set) => ({
    userPhone: '',
  }))