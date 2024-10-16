import AxiosInstance from "../components/Axios"
import { ChangelogProjectProps } from "../interfaces/changelog"

export async function getChangelogProjects(): Promise<ChangelogProjectProps[]> {
    try{
        const response = await AxiosInstance.get('/api/changelog/projects')
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}