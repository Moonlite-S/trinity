import React, { useState } from 'react';
import { Header } from './misc';
import { MainNavBar } from './MainMenu'

//To prevent errors; assigns properties to the tasks to maintain consistency
interface Task {
  id: number;
  text: string;
}

//Set a defined component *function Tasks() {...}* to create reusable UI element
//useState hook used to manage state within the Tasks component
export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]); //Holds an array of tasks, initial value of tasks *empty array*
  const [newTask, setNewTask] = useState(''); //Track input value for new tasks

  //*event* is an object representing the event triggering the function (user typing input field)
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) { //Specifies the parameter
    setNewTask(event.target.value); //DOM element that triggered event, retrieves current value of input field
  }

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

  return (
    <>
    <Header/>
      <div className="max-w-md my-5 mx-auto bg-slate-200 rounded-lg shadow-md p-6">
        <form>
        <h1 className="text-x1 font-semibold">Assign Tasks</h1>
        <div className="flex flex-col justify-center">
          <form className="flex flex-row justify-center gap-10 p-5"/>
            <div className="flex flex-col">
              <label htmlFor="new_task">Task Subject:</label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  value={newTask}
                  onChange={handleInputChange}
                />
            </div>

            <div className="flex flex-col my-3">
              <label htmlFor="task_description">Task Description:</label>
              <textarea placeholder="Enter description" name="task_description" required/>
            </div>

            <div className="mx-auto text-center justify-center">
            <button type="submit" className="bg-orange-300 rounded p-4" onClick={createTask}>Create Task</button>
            </div>

        </div>
        </form>

      </div>

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