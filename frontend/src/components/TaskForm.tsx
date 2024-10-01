import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getDataForTaskCreation } from "../api/tasks"
import { SelectionButtonProps } from "../interfaces/button_types"
import { TaskFormBaseProps, TaskProps } from "../interfaces/tasks_types"
import { SelectionComponent } from "./Buttons"
import { useTaskFormHandler } from "../hooks/taskFormHandler"

export function TaskForm() {
    const navigate = useNavigate()
  
    const [projects, setProjects] = useState<SelectionButtonProps[]>([])
    const [employees, setEmployees] = useState<SelectionButtonProps[]>([])
  
    const [currentTaskData, setCurrentTaskData] = useState<TaskProps>({
      project: "Select a project",
      task_id: "",
      title: "",
      description: "",
      assigned_to: "",
      project_id: "",
      due_date: "",
      status: "active"
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

    return <TaskFormBase {...{projects, employees, currentTaskData, onProjectSelectionChange, onAssignedToChange, onSubmit}}/>
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
      <TaskFormBase {...{projects, employees, currentTaskData, onProjectSelectionChange, onAssignedToChange, onSubmit}}/>
    );
}

function TaskFormBase({projects, employees, currentTaskData, onProjectSelectionChange,  onAssignedToChange, onSubmit}: TaskFormBaseProps) {

    const isUpdate: boolean = currentTaskData.task_id !== ""

    return (
    <form className="max-w-5xl w-full mx-auto my-5 bg-slate-200 rounded-lg shadow-md p-6 " onSubmit={onSubmit}>
        <div className="grid grid-cols-2 grid-flow-row justify-center gap-4 mb-4">
            <div className='grid grid-rows-2'>
            <label htmlFor="project_name">Project:</label>
            {projects && <SelectionComponent options={projects} name='project' Value={currentTaskData.project} onChange={onProjectSelectionChange}/>}
            </div>

            <div className='grid grid-rows-2'>
                <label htmlFor="task_id" className='mr-4'>Task ID:</label>
                <input
                type="text"
                placeholder="Enter subject"
                value={currentTaskData.task_id}
                name='task_id'
                required
                readOnly
                />
            </div>

            <div className='grid grid-rows-2'>
                <label htmlFor="title" className='mr-4'>Task Subject:</label>
                <input
                type="text"
                defaultValue={currentTaskData.title}
                placeholder="Enter subject"
                name='title'
                required
                />
            </div>

            <div className='grid grid-rows-2'>
                <label htmlFor="title" className='mr-4'>Assign To:</label>
                {employees && <SelectionComponent options={employees} name='assigned_to' Value={currentTaskData.assigned_to} onChange={onAssignedToChange}/>}
            </div>

            <div className='grid grid-rows-2'>
                <label htmlFor="title" className='mr-4'>Due Date:</label>
                <input type="date" name="due_date" defaultValue={currentTaskData.due_date} required/>
            </div>

            <div className='grid grid-rows-2 col-span-2'>
                <label htmlFor="description">Task Description:</label>
                <textarea placeholder="Enter description" name="description" defaultValue={currentTaskData.description} required/>
            </div>

        </div>

        <div className="mx-auto text-center justify-center">
            <button type="submit" className="bg-orange-300 rounded p-4" >{isUpdate ? "Update Task" : "Create Task"}</button>
        </div>
    </form>
    )
}