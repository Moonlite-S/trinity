import AxiosInstance from '../components/Axios';

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
      const response = await AxiosInstance.get('api/user')

      const data = response.data

      console.log(data)

      if (data){
        console.log("User verified")
        return 200
      } else {
        console.log("User not verified")
        return 401
      }

    } catch (error) {
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
      const response = await AxiosInstance.post('api/login', {
        email: email,
        password: password
      })

      const data = response.data

      console.log(data)

      if (data) {
        console.log("login successful")
        return 200
      } else {
        console.log("login failed")
        return 401
      }

    } catch (error) {
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
      const response = await AxiosInstance.post('api/logout', {})

      const data = response.data

      console.log(data)


      if (data.message == 'success') {
        console.log("Logged out")
        return 200
      } else {
        console.log("Logout failed")
        return 401
      }

    } catch (error) {
      console.error("Network Error: ",error)
      return 500
    }
}

export async function test_file() {
    try {
      const response = await AxiosInstance.get('api/projects/folder_generations')
      console.log(response)
    } catch (error) {
      console.error("Network Error: ",error)
    }
}