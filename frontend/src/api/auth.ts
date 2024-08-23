/**
 * This sends a GET request to the backend and verifies a user's authentication status
 * via the session token / cookie.
 * 
 * This is called everytime the user navigates anywhere in the app, aside from the login page
 * 
 * @returns a repsponse code representing if the user is verified or not
 */
export async function checkUser(): Promise<number> {
    try {
      const response = await fetch('http://localhost:8000/api/user', {
        method: 'GET',
        credentials: 'include', // This gets the cookies
        headers: {
          'Content-Type': 'application/json',
        }
        })

        // If user is verified
        if (response.ok) {
          const data = await response.json()
          console.log(data)

          if (data) {
            console.log("User verified")
            return response.status
          } else {
            console.log("User not verified")
            return response.status
          } 
        }
        // Any other error
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

type LoginProps = {
    email: string,
    password: string
}
/**
 * This sends a POST request to the backend and logs in a user
 * This function returns a boolean representing if the login was successfully authenticated.
 * 
 * (true = success, false = failure)
 * 
 * @param email user-inputted email
 * @param password user-inputted password
 */
export async function login({email, password }: LoginProps): Promise<number> {
    try {
        const response = await fetch('http://localhost:8000/api/login', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password
          }),
        });

        if (response.ok) {
          const data = await response.json()
          console.log("login successful" + data)
          return response.status
        } else {
          return response.status
        }
      }

      catch (error) {
        console.error("Network Error: ",error)
        return 500
      }
}

/**
 * Sends a GET request to log the user out
 * 
 * TODO: Make sure to delete the session token
 * and anything that ties back to the user
 */
export async function logout(): Promise<number> {
    try {
      const response = await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          }
      })

      if (!response.ok) {
          return response.status
      }

      console.log("Logged out")
      return response.status

    } catch (error) {
      console.error("Network Error: ",error)
      return 500
    }
}
