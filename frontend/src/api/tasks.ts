import AxiosInstance from "../components/Axios";
import { TaskProps } from "../interfaces/tasks_types";

export function postTask(task: TaskProps) {
    try {
        const response = AxiosInstance.post('api/task/', {
            title: task.title,
            description: task.description,
            assigned_to: task.assigned_to,
            project_id: task.project_id,
            due_date: task.due_date
        })

        if (!response) { 
            throw new Error("Error creating task")
        }

        return response
    } catch (error) {
        console.error(error)
        throw error
    }
}

export function filterTasksByProject(project_id: string) {
    try {
        const response = AxiosInstance.get('api/project_id/' + project_id)

        if (!response) {
            throw new Error("Error fetching tasks")
        }

        return response
    } catch (error) {
        console.error(error)
        throw error
    }
}