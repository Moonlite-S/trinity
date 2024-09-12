import React, { useEffect, useState } from 'react';
import { Header } from './misc';
import { getEmployeeNameList } from '../api/employee';
import { getProjectList } from '../api/projects';
import { SelectButtonProps  } from '../interfaces/project_types';
import { SelectionComponent } from './Buttons';
//To prevent errors; assigns properties to the tasks to maintain consistency
interface Task {
  id: number;
  text: string;
}

//*TODO:
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
  const [tasks, setTasks] = useState<Task[]>([]); //Holds an array of tasks, initial value of tasks *empty array*
  const [newTask, setNewTask] = useState(''); //Track input value for new tasks

  const [employeeOptions, setEmployeeOptions] = useState<SelectButtonProps[]>([]);
  const [projectOptions, setProjectOptions] = useState<SelectButtonProps[]>([]);

  //*event* is an object representing the event triggering the function (user typing input field)
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) { //Specifies the parameter
    setNewTask(event.target.value); //DOM element that triggered event, retrieves current value of input field
  }
  
  console.log(tasks)  // unused variables casues linting error, so uh yeah i put this here

  function createTask() {
    if (newTask.trim() !== '') {
      setTasks((prevTasks) => [
        ...prevTasks,
        { id: Date.now(), text: newTask },
      ]);
      setNewTask('');
    }
  }

  function deleteTask(id: number) {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  }

  function editTask(id: number) {
    const index = tasks.findIndex((task) => task.id === id);
    if (index > 0) {
      const updatedTasks = [...tasks];
      [updatedTasks[index], updatedTasks[index - 1]] = [
        updatedTasks[index - 1],
        updatedTasks[index],
      ];
      setTasks(updatedTasks);
    }
  }

  useEffect(() => {
    // Fetches the neccessary data from the backend
    const fetchData = async () => {
      try {
        const users = await getEmployeeNameList();
        const mapped_users = users.map((user) => ({
          value: user,
          label: user
        }))
        setEmployeeOptions(mapped_users);

        const projects = await getProjectList();
        const mapped_projects = projects.map((project) => ({
          value: project.project_name,
          label: project.project_name
        }))
        setProjectOptions(mapped_projects);
        
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
        <form className="max-w-5xl w-full mx-auto my-5 bg-slate-200 rounded-lg shadow-md p-6 ">
          <div className="grid grid-cols-4 grid-flow-row justify-center gap-4 mb-4">
              <div className='grid grid-rows-2'>
                <label htmlFor="project_id">Project:</label>
                <SelectionComponent options={projectOptions} defaultValue='' name='project_id'/>
              </div>

              <div className='grid grid-rows-2'>
                <label htmlFor="title" className='mr-4'>Task Subject:</label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  value={newTask}
                  onChange={handleInputChange}
                  name='title'
                />
              </div>

              <div className='grid grid-rows-2'>
                <label htmlFor="title" className='mr-4'>Assign To:</label>
                <SelectionComponent options={employeeOptions} defaultValue='' name='assigned_to'/>
              </div>


              <div className='grid grid-rows-2'>
                <label htmlFor="title" className='mr-4'>Due Date:</label>
                <input type="date" name="due_date" required/>
              </div>

              <div className='grid grid-rows-2 col-span-4'>
                <label htmlFor="task_description">Task Description:</label>
                <textarea placeholder="Enter description" name="task_description" required/>
              </div>

          </div>

          <div className="mx-auto text-center justify-center">
            <button type="submit" className="bg-orange-300 rounded p-4" onClick={createTask}>Create Task</button>
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
          <button type="submit" className="bg-orange-300 rounded p-4" onClick={createTask}>Update Task</button>
          </div>

        </form>
      </div>
    </>
  );
}