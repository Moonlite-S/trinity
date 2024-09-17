import React, { ChangeEvent, useEffect, useState } from 'react';
import { Header } from './misc';
import { getEmployeeNameList } from '../api/employee';
import { getProjectList } from '../api/projects';
import { ProjectProps  } from '../interfaces/project_types';
import { filterTasksByProject, postTask } from '../api/tasks';
import { TaskProps } from '../interfaces/tasks_types';
import { useNavigate } from 'react-router-dom';
//To prevent errors; assigns properties to the tasks to maintain consistency

//*TODO:
/* - Put all the current tasks when selecting a project on top
/* - Ask Joey on:
/* - Do i have to assign a unique id for tasks
/* - How can i look at tasks through projects
/* - How can i look at tasks through employees
/* - How can i look at tasks through dates
/* - How can i look at tasks through status
/* - How can i look at tasks through priority
/* - How can i look at tasks through tags
/* - Does tasks and projects have foreign keys to each other
*/

//Set a defined component *function Tasks() {...}* to create reusable UI element
//useState hook used to manage state within the Tasks component
export function Tasks() {
  const [tasks, setTasks] = useState<TaskProps[]>([]); //Holds an array of tasks, initial value of tasks *empty array*
  const [newTask, setNewTask] = useState(''); //Track input value for new tasks
  const navigate = useNavigate();

  const [employeelist, setEmployeelist] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectProps[]>([]);
  const [SelectedProject, setSelectedProject] = useState<ProjectProps>({project_name: ""} as ProjectProps);
  const [taskID, setTaskID] = useState<string>("");

  //*event* is an object representing the event triggering the function (user typing input field)
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) { //Specifies the parameter
    setNewTask(event.target.value); //DOM element that triggered event, retrieves current value of input field
  }

  const onProjectSelection = async(event: ChangeEvent<HTMLSelectElement>) => {
    const newProjectName = event.target.value;

    // Gets the project id from the selected project
    const project_id = projects.find(project => project.project_name === newProjectName)?.project_id ?? '';

    setSelectedProject(prevData => ({...prevData, project_name: newProjectName, project_id: project_id}))

    const tasks = await filterTasksByProject(project_id);

    setTasks(tasks);

    console.log("Tasks: ", tasks)

    console.log("Task length: ", tasks.length)

    // Formats the task id to be: "T-<project id>-<task length + 1>"
    const task_number = String(tasks.length + 1).padStart(3, '0');
    setTaskID("T-" + project_id + "-" + task_number)
 
  }

  const onSubmit = async (e: any) => {
    e.preventDefault();

    const form_data = new FormData(e.target);

    // Basically send everything aside from the project title
    const data_to_send: TaskProps = {
      task_id: form_data.get('task_id') as string,
      title: form_data.get('title') as string,
      description: form_data.get('description') as string,
      assigned_to: form_data.get('assigned_to') as string,
      due_date: form_data.get('due_date') as string,
      project_id: SelectedProject.project_id
    }

    console.log(data_to_send.project_id)

    try {
      const result_code = await postTask(data_to_send);

      switch (result_code) {
        case 201:
          alert("Task created successfully!")
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

    } catch (error: unknown) {
      console.error("Something went wrong: ", error)
    }
  }

  useEffect(() => {
    // Fetches the neccessary data from the backend
    const fetchData = async () => {
      try {
        const users = await getEmployeeNameList();
        setEmployeelist(users);

        const projects = await getProjectList();
        setProjects(projects);
        
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [])

  return (
    <>
    <Header/>
      <h1 className="mx-4 text-x1 font-semibold">Assign Task</h1>
        <form className="max-w-5xl w-full mx-auto my-5 bg-slate-200 rounded-lg shadow-md p-6 " onSubmit={onSubmit}>
          <div className="grid grid-cols-2 grid-flow-row justify-center gap-4 mb-4">
              <div className='grid grid-rows-2'>
                <label htmlFor="project_name">Project:</label>
                <select name="project_name" id="project_name" value={SelectedProject.project_name} onChange={onProjectSelection}>
                  <option value="" disabled>== Select a project ==</option>
                  {projects.map((option) => (
                    <option key={option.project_id} value={option.project_name}>
                      {option.project_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className='grid grid-rows-2'>
                <label htmlFor="task_id" className='mr-4'>Task ID:</label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  value={taskID}
                  onChange={handleInputChange}
                  name='task_id'
                  required
                  readOnly
                />
              </div>

              <div className='grid grid-rows-2'>
                <label htmlFor="title" className='mr-4'>Task Subject:</label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  value={newTask}
                  onChange={handleInputChange}
                  name='title'
                  required
                />
              </div>

              <div className='grid grid-rows-2'>
                <label htmlFor="title" className='mr-4'>Assign To:</label>
                <select name="assigned_to" id="assigned_to" required>
                  {employeelist.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className='grid grid-rows-2'>
                <label htmlFor="title" className='mr-4'>Due Date:</label>
                <input type="date" name="due_date" required/>
              </div>

              <div className='grid grid-rows-2 col-span-2'>
                <label htmlFor="description">Task Description:</label>
                <textarea placeholder="Enter description" name="description" required/>
              </div>

          </div>

          <div className="mx-auto text-center justify-center">
            <button type="submit" className="bg-orange-300 rounded p-4" >Create Task</button>
          </div>
        </form>


      <div className="max-w-md mx-auto bg-slate-100 rounded-lg shadow-md p-6">
        <form>
          <h1 className="text-x1 font-semibold">Task Progress and Updates</h1>
          <div>
            <div className="flex flex-row justify-center gap-10 p-5">
              <div className="flex flex-col">
                <select className="w-full p-2 border rounded">
                  <option value="">Select Task</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="edit_task">Task Subject:</label>
              <input
                type="text"
                placeholder="Edit subject"
                onChange={handleInputChange}
              />
          </div>

          <div className="flex flex-col my-3">
            <label htmlFor="edit_description">Task Description:</label>
            <textarea placeholder="Edit description" name="task_description" required/>
          </div>

          <div className="mx-auto text-center justify-center">
          <button type="submit" className="bg-orange-300 rounded p-4">Update Task</button>
          </div>

        </form>
      </div>
    </>
  );
}

export function TaskList() {
  return (
    <>
    <Header/>
      <h1 className="mx-4 text-x1 font-semibold">Task List</h1>
    </>
  );
}