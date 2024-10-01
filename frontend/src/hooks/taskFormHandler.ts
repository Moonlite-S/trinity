import { FormEvent } from "react";
import { filterTasksByProject, postTask, updateTask } from "../api/tasks";
import { TaskProps } from "../interfaces/tasks_types";
import { NavigateFunction } from "react-router-dom";
import { SelectionButtonProps } from "../interfaces/button_types";

export function useTaskFormHandler(
    setCurrentTaskData: React.Dispatch<React.SetStateAction<TaskProps>>,
    currentTaskData: TaskProps,
    navigate: NavigateFunction,
    method: "POST" | "PUT",
    projects: SelectionButtonProps[]
) {
      function onAssignedToChange(event: unknown) {
        if (event && typeof event === 'object' && 'value' in event && 'label' in event) {
          setCurrentTaskData({...currentTaskData, assigned_to: event.label as string});

          console.log("assigned_to: ", event.label)
        } else {
          console.error("Invalid event object")
        }
      }
    
      const onProjectSelectionChange = async(e: unknown) => {
        // This is to ensure that the value is of the correct type (SelectionButtonProps)
        if (e && typeof e === 'object' && 'value' in e && 'label' in e) {
          const newProjectName = e.value
    
          console.log("newProjectName: ", newProjectName)
    
          // Gets the project id from the selected project
          const project_id = projects.find(project => project.value === newProjectName)?.value ?? ''
    
          setCurrentTaskData(prevData => ({...prevData, project: newProjectName as string, project_id: project_id}))
    
          const tasks = await filterTasksByProject(project_id);
    
          // Formats the task id to be: "T-<project id>-<task length + 1>"
          const task_number = String(tasks.length + 1).padStart(3, '0');
          setCurrentTaskData(prevData => ({...prevData, task_id: "T-" + project_id + "-" + task_number}))
        } else {
          console.error("Invalid event object")
        }
      }
    
      const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        const form_data = new FormData(e.currentTarget);

        const convert_project_obj_str_to_id = currentTaskData.project_id.split('|')[0].slice(4).trim()
    
        // Basically send everything aside from the project title
        const data_to_send: TaskProps = {
          project: form_data.get('project') as string,
          task_id: form_data.get('task_id') as string,
          title: form_data.get('title') as string,
          description: form_data.get('description') as string,
          assigned_to: form_data.get('assigned_to') as string,
          due_date: form_data.get('due_date') as string,
          project_id: convert_project_obj_str_to_id,
          status: 'active'
        }
    
        console.log(data_to_send)
    
        try {
            const method_handler = MethodHandler(method);

            if (method_handler) {
                const result_code = await method_handler(data_to_send as TaskProps);

                switch (result_code) {
                    case 201:
                        alert("Task created successfully!");
                        navigate("/main_menu")
                    break
                    case 200:
                        alert("Task updated successfully!");
                        navigate("/main_menu")
                    break
                    case 400:
                    alert("Bad Request: Invalid data. Please make sure all fields are filled out. Error: " + result_code)
                    break
                    case 403:
                    alert("Forbidden: You are not authorized to create tasks. Error: " + result_code)
                    break
                    default:
                    throw new Error("Error creating task: " + result_code)
                }
            }
        } catch (error: unknown) {
          console.error("Something went wrong: ", error)
        }
    }

    return {
        onAssignedToChange,
        onProjectSelectionChange,
        onSubmit
    }
}

function MethodHandler(method: "POST" | "PUT") {
    if (method === "POST"){
        return postTask
    }
    else if (method === "PUT"){
        return updateTask
    }
}
