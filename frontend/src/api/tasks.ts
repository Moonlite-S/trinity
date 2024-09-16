import { AxiosError } from "axios";
import AxiosInstance from "../components/Axios";
import { TaskProps } from "../interfaces/tasks_types";

export async function postTask(task: TaskProps): Promise<Number> {
    try {
        await AxiosInstance.post('api/task/', {
            task_id: task.task_id,
            title: task.title,
            description: task.description,
            assigned_to: task.assigned_to,
            project_id: task.project_id,
            due_date: task.due_date
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

export async function filterTasksByProject(project_id: string): Promise<TaskProps[]> {
    try {
        const response = await AxiosInstance.get('api/task/project_id/' + project_id)

        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}