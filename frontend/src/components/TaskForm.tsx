import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getDataForTaskCreation } from "../api/tasks"
import { SelectionButtonProps } from "../interfaces/button_types"
import { TaskFormBaseProps, TaskProps } from "../interfaces/tasks_types"
import { BottomFormButton, SelectionComponent } from "./Buttons"
import { useTaskFormHandler } from "../hooks/taskFormHandler"
import { GenericForm, GenericInput, GenericSlider, GenericSelect, GenericTextArea } from "./GenericForm"
import { useAuth } from "../App"
import { Error_Component } from "./misc"

export function TaskForm({task_data, method}: {task_data?: TaskProps, method: "POST" | "PUT"}) {
    const { user } = useAuth()
    if (!user) {
        return <div>Loading...</div>
    }

    const navigate = useNavigate()

    const [projects, setProjects] = useState<SelectionButtonProps[]>([])
    const [employees, setEmployees] = useState<SelectionButtonProps[]>([])
    const [errorString, setErrorString] = useState<string>("")
    const [currentTaskData, setCurrentTaskData] = useState<TaskProps>(task_data ?? {
      task_id: "",
      project: "Select a project",
      title: "",
      description: "",
      assigned_to: "",
      project_id: "",
      due_date: new Date().toLocaleDateString('en-CA'),
      status: "ACTIVE",
      completion_percentage: 0
    })
  
    const { onAssignedToChange, onProjectSelectionChange, onSliderChange, onSubmit } = useTaskFormHandler(setCurrentTaskData, currentTaskData, navigate, setErrorString, method, projects)

    useEffect(() => {
        // Fetches the neccessary data from the backend
        const fetchData = async () => {
          try {
            const data = await getDataForTaskCreation()
    
            if (!data) {
              throw new Error("Error fetching task data")
            }

            const obj_employees = data.employees.map((value: string[]) => {
              return { value: value[0], label: value[1] }
            })
            setEmployees(obj_employees)
    
            const obj_projects = data.projects.map((value: string[]) => {
              return { value: value[0], label: value[1] }
            })
            setProjects(obj_projects)

            // Only used if the task_data is passed in
            if (task_data) {
              setCurrentTaskData(task_data)
              
              // The project_id is using the __str__ representation of the object
              // I don't really like this but it works for now
              const convert_project_obj_str_to_id = currentTaskData.project_id.split('|')[0].slice(4).trim()

              const find_assigned_project = obj_projects.find(project => project.value === convert_project_obj_str_to_id)?.label ?? ""
  
              setCurrentTaskData(prev => ({...prev, project: find_assigned_project}))
              
              // This check is necessary when creating a task directly from the dashboard
              // Because the assigned_to is empty, it will lead to an error
              if (currentTaskData.assigned_to !== "") {
                const convert_employee_obj_str_to_id = currentTaskData.assigned_to.split('|')[1].trim()
                const find_assigned_employee = obj_employees.find(employee => employee.value === convert_employee_obj_str_to_id)?.label ?? ""
                setCurrentTaskData(prev => ({...prev, assigned_to: find_assigned_employee}))
              }
            }

          } catch (error) {
            console.error(error)
          }
        }
    
        fetchData()
      }, [])
  
    return (
    <>
    {errorString && <Error_Component errorString={errorString} />}
    <TaskFormBase 
        user={user}
        projects={projects}
        employees={employees}
        currentTaskData={currentTaskData}
        onProjectSelectionChange={onProjectSelectionChange}
        onAssignedToChange={onAssignedToChange}
        onSliderChange={onSliderChange}
        onSubmit={onSubmit}
        method={method}
      />
    </>
    )
}

function TaskFormBase({user, projects, employees, currentTaskData, onProjectSelectionChange, onAssignedToChange, onSliderChange, onSubmit, method}: TaskFormBaseProps) {
  const method_string = {
    POST: "Create Task",
    PUT: "Update Task",
  }

  const status_options = user.role === "Team Member" ? ["ACTIVE", "CLOSING"] : ["ACTIVE", "CLOSING", "COMPLETED"]

  return (
      <GenericForm form_id="task_form" onSubmit={onSubmit}>
        <GenericInput label="Task Subject" value={currentTaskData.title} name="title" type="text"/>
        <div className="grid grid-cols-2 gap-4">
          <SelectionComponent label="Project" options={projects} name='project' Value={currentTaskData.project} onChange={onProjectSelectionChange} readonly={user.role === "Team Member"}/>
          <SelectionComponent label="Assign To" options={employees} name='assigned_to' Value={currentTaskData.assigned_to} onChange={onAssignedToChange} readonly={user.role === "Team Member"}/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <GenericSelect label="Status" options={status_options} name='status' value={currentTaskData.status}/>
          <GenericInput label="Due Date" value={currentTaskData.due_date} name="due_date" type="date"/>
        </div>
        <GenericTextArea label="Task Description" value={currentTaskData.description} name="description"/>
        <GenericSlider label="Completion Percentage" value={currentTaskData.completion_percentage} name="completion_percentage" onChange={onSliderChange}/>

        <BottomFormButton button_text={method_string[method]}/>
      </GenericForm>
    )
}