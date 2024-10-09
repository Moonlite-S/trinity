import { AxiosError } from "axios";
import AxiosInstance from "../components/Axios";
import { TaskCreationProps, TaskProps } from "../interfaces/tasks_types";

export async function postTask(task: TaskProps): Promise<number> {
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

export async function updateTask(task: TaskProps): Promise<number> {
    try {
        await AxiosInstance.put('api/task/id/' + task.task_id, task)

        return 200
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

export async function closeTask(task_id: string): Promise<number> {
    try {
        await AxiosInstance.put('api/task/id/' + task_id, {
            is_active: false
        })

        return 200
    } catch (error) {
        console.error(error)
        throw error
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

/**
 * This gets all the tasks for the projects that the user is a part of
 * 
 * @param email the user's email
 * @returns An array of tasks
 */
export async function filterTasksByAllUserProjects(email: string): Promise<TaskProps[]> {
    try {
        const response = await AxiosInstance.get('api/task/all_user_projects/' + email)

        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export async function filterTasksByUser(email: string): Promise<TaskProps[]> {
    try {
        const response = await AxiosInstance.get('api/task/assigned_to/' + email)

        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export async function getTaskByID(id: string): Promise<TaskProps> {
    try {
        const response = await AxiosInstance.get('api/task/id/' + id)

        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export async function getDataForTaskCreation(): Promise<TaskCreationProps> {
    try {
        const response = await AxiosInstance.get('api/task/creation_data')
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export async function deleteTask(id: string): Promise<number> {
    try {
        await AxiosInstance.delete('api/task/id/' + id)
        return 200
    } catch (error) {
        console.error(error)
        throw error
    }
}

export async function getTaskList(): Promise<TaskProps[]> {
    try {
        const response = await AxiosInstance.get('api/task/')
        return response.data
    } catch (error: unknown) {
        throw error
    }
}
