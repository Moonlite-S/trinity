import AxiosInstance from "../components/Axios"

/**
 * Sends a POST request to the backend to create a new project
 * 
 * @param folder_name The pathname of the folder [PARENT FOLDERS MUST ALREADY EXIST]
 */
export async function CreateProjectFolder(folder_name: string) {
    try {
        const response = await AxiosInstance.post('api/projects/folder_generations', {
            "folder_name": folder_name,
        })
        console.log(response)
    } catch (error) {
        console.error("Network Error: ",error)
    }
}

export async function CreateProject() {
    const random = Math.random()
      try {
        const response = await AxiosInstance.post('api/projects/folder_generations', {
          "folder_name": "random/" + random,
        })
        console.log(response)
      } catch (error) {
        console.error("Network Error: ",error)
      }
}