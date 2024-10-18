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

    return "200"
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data.non_field_errors[0]
      return errorMessage
    }
    return "500"
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
      const response = await AxiosInstance.post('auth/logout/', {}, {
        headers: {
          'Authorization': `${AxiosInstance.defaults.headers['Authorization']}`
        }
      })

      if (response.status == 200) {
        console.log("Logged out")
        removeCookie('authToken')
        delete AxiosInstance.defaults.headers['Authorization']
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
