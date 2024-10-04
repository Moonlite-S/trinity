import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getDataForTaskCreation } from "../api/tasks"
import { SelectionButtonProps } from "../interfaces/button_types"
import { TaskFormBaseProps, TaskProps } from "../interfaces/tasks_types"
import { BottomFormButton, SelectionComponent } from "./Buttons"
import { useTaskFormHandler } from "../hooks/taskFormHandler"
import { GenericForm, GenericInput } from "./GenericForm"

export function TaskForm() {
    const navigate = useNavigate()
  
    const [projects, setProjects] = useState<SelectionButtonProps[]>([])
    const [employees, setEmployees] = useState<SelectionButtonProps[]>([])
  
    const [currentTaskData, setCurrentTaskData] = useState<TaskProps>({
      task_id: "",
      project: "Select a project",
      title: "",
      description: "",
      assigned_to: "",
      project_id: "",
      due_date: new Date().toLocaleDateString('en-CA'),
      status: "ACTIVE"
    })
  
    const { onAssignedToChange, onProjectSelectionChange, onSubmit } = useTaskFormHandler(setCurrentTaskData, currentTaskData, navigate, "POST", projects)

    useEffect(() => {
      // Fetches the neccessary data from the backend
      const fetchData = async () => {
        try {
          const data = await getDataForTaskCreation()
  
          if (!data) {
            throw new Error("Error fetching task data")
          }
  
          console.log(data)
  
          const obj_employees = data.employees.map((value: string[]) => {
            return { value: value[0], label: value[1] }
          })
          setEmployees(obj_employees)
  
          const obj_projects = data.projects.map((value: string[]) => {
            return { value: value[0], label: value[1] }
          })
          setProjects(obj_projects)
  
        } catch (error) {
          console.error(error);
        }
      }
  
      fetchData();
    }, [])

    return <TaskFormBase 
        projects={projects}
        employees={employees}
        currentTaskData={currentTaskData}
        onProjectSelectionChange={onProjectSelectionChange}
        onAssignedToChange={onAssignedToChange}
        onSubmit={onSubmit}
        method="POST"
    />
}

export function UpdateTask({task_data}: {task_data: TaskProps}) {
    const navigate = useNavigate()

    const [projects, setProjects] = useState<SelectionButtonProps[]>([])
    const [employees, setEmployees] = useState<SelectionButtonProps[]>([])
  
    const [currentTaskData, setCurrentTaskData] = useState<TaskProps>(task_data)
  
    const { onAssignedToChange, onProjectSelectionChange, onSubmit } = useTaskFormHandler(setCurrentTaskData, currentTaskData, navigate, "PUT", projects)

    useEffect(() => {
        // Fetches the neccessary data from the backend
        const fetchData = async () => {
          try {
            const data = await getDataForTaskCreation()
    
            if (!data) {
              throw new Error("Error fetching task data")
            }

            if (!task_data) {
                throw new Error("Error fetching task data")
            }

            setCurrentTaskData(task_data)

            const obj_employees = data.employees.map((value: string[]) => {
              return { value: value[0], label: value[1] }
            })
            setEmployees(obj_employees)
    
            const obj_projects = data.projects.map((value: string[]) => {
              return { value: value[0], label: value[1] }
            })
            setProjects(obj_projects)

            // The project_id is using the __str__ representation of the object
            // I don't really like this but it works for now
            const convert_project_obj_str_to_id = currentTaskData.project_id.split('|')[0].slice(4).trim()

            const find_assigned_project = obj_projects.find(project => project.value === convert_project_obj_str_to_id)?.label ?? ""

            setCurrentTaskData(prev => ({...prev, project: find_assigned_project}))

            const convert_employee_obj_str_to_id = currentTaskData.assigned_to.split('|')[1].trim()

            const find_assigned_employee = obj_employees.find(employee => employee.value === convert_employee_obj_str_to_id)?.label ?? ""

            setCurrentTaskData(prev => ({...prev, assigned_to: find_assigned_employee}))

          } catch (error) {
            console.error(error);
          }
        }
    
        fetchData();
      }, [])
  
    return (
      <TaskFormBase 
        projects={projects}
        employees={employees}
        currentTaskData={currentTaskData}
        onProjectSelectionChange={onProjectSelectionChange}
        onAssignedToChange={onAssignedToChange}
        onSubmit={onSubmit}
        method="PUT"
    />
    );
}

function TaskFormBase({projects, employees, currentTaskData, onProjectSelectionChange,  onAssignedToChange, onSubmit, method}: TaskFormBaseProps) {
    return (
      <GenericForm form_id="task_form" onSubmit={onSubmit}>
        <GenericInput label="Task Subject" value={currentTaskData.title} name="title" type="text"/>
        <SelectionComponent label="Project" options={projects} name='project' Value={currentTaskData.project} onChange={onProjectSelectionChange}/>
        <SelectionComponent label="Assign To" options={employees} name='assigned_to' Value={currentTaskData.assigned_to} onChange={onAssignedToChange}/>
        <GenericInput label="Due Date" value={currentTaskData.due_date} name="due_date" type="date"/>
        <GenericInput label="Task Description" value={currentTaskData.description} name="description" type="text"/>

        <BottomFormButton button_text={method === "POST" ? "Submit" : "Update"}/>
      </GenericForm>
    )
}