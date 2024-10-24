import { AxiosError } from 'axios'
import AxiosInstance from '../components/Axios'
import { EmployeeProps } from '../interfaces/employee_type'
import { removeCookie } from 'typescript-cookie'
/**
 * This sends a GET request to the backend and verifies a user's authentication status
 * via the session token / cookie.
 * 
 * This is called everytime the user navigates anywhere in the app, aside from the login page
 * 
 * @returns the user's information like name, email, their assigned role, and their assigned projects and tasks
 */
export async function checkUser(): Promise<EmployeeProps> {
  try {
    const response = await AxiosInstance.get('auth/user/')
    const data = response.data['user']
    return data

  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        // User is not authenticated
        console.log("User is not authenticated")
        throw new Error('Unauthorized')
      } else if (error.response?.status === 403) {
        // 403 Forbidden
        throw new Error('Forbidden')
      } else {
        console.error("Axios error: ", error)
        throw new Error('Network Error')
      }
    } else if (error instanceof Error) {
      console.error("Error: ", error)
      throw new Error('Network Error')
    } else {
      console.error("Unknown error: ", error)
      throw new Error('Network Error')
    }
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
 * 
 * @returns the session token
 */
export async function login({email, password }: LoginProps): Promise<string> {
  try {
    const csrfResponse = await AxiosInstance.get('auth/csrf')
    console.log("CSRF response: ", csrfResponse)

    const response = await AxiosInstance.post('auth/login/', {
      username: email,
      password: password
    })

    const token = response.data.key

    AxiosInstance.defaults.headers['Authorization'] = `Token ${token}`
    console.log("Authentication token: ", token)

    return "200" // Returns a string cuz if it returns an error, it'll return a string lol
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data.non_field_errors[0]
      return errorMessage
    }
    return "500"
  }
}

/**
 * Sends a POST request to log the user out
 * 
 * This is a very weird way to log out.
 * 
 * @returns a tuple [azureLogoutUrl, statusCode], where azureLogoutUrl is the URL to redirect to after logging out from Azure AD
 * 
 * if the user didn't log in through Microsoft, then azureLogoutUrl will be an empty string
 * 
 * TODO: Make sure to delete the session token
 * and anything that ties back to the user
 */
export async function logout(): Promise<[string, string]> {
    try {
      const response = await AxiosInstance.post('auth/logout/', {}, {
        headers: {
          'Authorization': `${AxiosInstance.defaults.headers['Authorization']}`
        }
      })

      const azureLogoutUrl = response.data.redirect_url

      console.log("Logout Response: ", response)

      if (response.status == 200) {
        console.log("Logged out")
        removeCookie('authToken')
        delete AxiosInstance.defaults.headers['Authorization']
        if (azureLogoutUrl) {
          return [azureLogoutUrl, "200"]
        } else {
          return ["", "200"]
        }
      } else {
        console.log("Logout failed")
        return ["401", "401"]
      }

    } catch (error) {
      console.error("Network Error: ",error)
      return ["500", "500"]
    }
}

/**
 * This function is used to log in a user with their Microsoft account
 * 
 * First it gets the Microsoft login URL and redirects the user to it
 * 
 * After the user logs in the MS login, the callback URL goes to the backend
 * where the user's information is verified and a session token is created
 * 
 * TODO: It returns the key, which is what the auth_token is, so all we need to do is
 * store the key in the cookie. Most likely in another function
 * 
 * @returns the status code of the request
 */
export async function microsoftLogin(): Promise<number> {
  try {
    const response = await AxiosInstance.get('api/login_athen')
    const data = response.data

    window.location.href = data.auth_url // Redirect to the Microsoft login page
    console.log("Redirecting to Microsoft login page: ", data.auth_url)
    
    return response.status
  } catch (error) {
    console.error("Network Error: ", error)
    return 500
  }
}

/**
 * We need this to get the auth token given by the end of the azure_ad_callback function from the backend
 * 
 * This gets called at the AuthCallback component
 * 
 * @param token the token that is sent to the callback URL
 * @returns the status code of the request
 */
export async function get_auth_and_redirect(token: string): Promise<number> {
  try {
    console.log("token: ", token)
    AxiosInstance.defaults.headers['Authorization'] = `Token ${token}`
    return 200
  } catch (error) {
    console.error("Network Error: ", error)
    return 500
  }
}
