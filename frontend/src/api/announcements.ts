import { AxiosError } from "axios"
import AxiosInstance from "../components/Axios"
import { AnnouncementProps } from "../interfaces/announcement_types"

export async function postAnnouncement(announcement: AnnouncementProps): Promise<number> {
    try {
        await AxiosInstance.post('api/announcements/', {
            title: announcement.title,
            content: announcement.content,
            author: announcement.author
        })

        return 201
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 400) {
                // 400 Bad Request
                return 400
            } else if (error.response?.status === 403) {
                // 403 Forbidden
                return 403
            } else {
                console.error("Axios error: ", error)
                return 500
            }
        } else if (error instanceof Error) {
            console.error("Error: ", error)
            return 500
        } else {
            console.error("Unknown error: ", error)
            return 500
        }
    }
}

export async function getAnnouncements(): Promise<AnnouncementProps[]> {
    try {
        const response = await AxiosInstance.get('api/announcements/')

        return response.data

    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 400) {
                // 400 Bad Request
                return []
            } else if (error.response?.status === 403) {
                // 403 Forbidden
                return []
            } else {
                console.error("Axios error: ", error)
                return []
            }
        } else if (error instanceof Error) {
            console.error("Error: ", error)
            return []
        } else {
            console.error("Unknown error: ", error)
            return []
        }
    }
}