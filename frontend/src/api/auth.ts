/**
 * This sends a GET request to the backend and verifies a user's authentication status
 * via the session token / cookie.
 * 
 * @returns a boolean representing if the user is verified or not
 */
export const checkUser = async(): Promise<boolean> => {
    try {
    const response = await fetch('/api/user/verify', {
      method: 'GET',
      credentials: 'include', // This gets the cookies
      headers: {
        'Content-Type': 'application/json',
      }
      })

      // If user is verified
      if (response.ok) {
        const data = await response.json()

        if (data.isVerified) {
          console.log("User verified")
          return true
        } else {
          console.log("User not verified")
          return false
        } 
      }
      // If user is not verified
      else if (response.status === 401) {
        console.log("User not verified")
        return false
      }
      // Any other error
      else {
        console.log("Server Error")
        return false 
      }
    }

    catch (error) {
      console.error("Network Error: ",error)
      return false
    }
}

type LoginProps = {
    username: string,
    password: string
}
/**
 * This sends a POST request to the backend and logs in a user
 * This function returns a boolean representing if the login was successfully authenticated.
 * 
 * (true = success, false = failure)
 * 
 * @param username user-inputted username
 * @param password user-inputted password
 * @returns 
 */
export const login = async({username, password }: LoginProps): Promise<number> => {
    try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        });

        if (response.ok) {
          const data = await response.json()
          console.log("login successful" + data)
          return response.status
        }
        else if (response.status === 401) {
          console.log("login failed")
          //setError(true)
          return response.status
        }
        else {
          console.log("Server Error")
          return response.status
        }
      }

      catch (error) {
        console.error("Network Error: ",error)
        return 500
      }
}