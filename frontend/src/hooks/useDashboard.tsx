import { useEffect, useState } from "react"

/**
 * ## useDashboard
 * 
 * A custom hook that provides functions to mark a card as seen and to check if a card is new.
 * 
 * The cards are identified by their type and id.
 * 
 * I might add more things to this in the future.
 * 
 * @param markAsSeen - A function to mark a card as seen (takes in the card type and id)
 * @param isNewCard - A function to check if a card is new (takes in the card type and id)
 * 
 * @returns a function to mark a card as seen and a function to check if a card is new
 */
export default function useDashboard() {
    const [seenCards, setSeenCards] = useLocalStorage<Record<string, boolean>>("seenCards", {})

    const markAsSeen = (cardType: string, id: string) => {
        setSeenCards(prev => ({...prev, [`${cardType}-${id}`]: true}))
    }

    const isNewCard = (cardType: string, id: string) => {
        return !seenCards[`${cardType}-${id}`]
    }

    return {markAsSeen, isNewCard}
}

/**
 * ## useLocalStorage
 * 
 * A custom hook that provides a local storage utility.
 * 
 * @param key - The key to store the value under
 * @param initialValue - The initial value to store
 * @returns a tuple containing the stored value and a function to set the value
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.log(error)
            return initialValue
        }
    })

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(storedValue))
    }, [key, storedValue])

    return [storedValue, setStoredValue]
}