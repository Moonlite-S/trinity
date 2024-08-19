import React, { useState } from 'react';
import { Header } from './misc';

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

  function createTask() { //LEFT OFF HERE WITH LEARNING THE CODE!!!
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

  function moveTaskUp(id: number) {
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

  function moveTaskDown(id: number) {
    const index = tasks.findIndex((task) => task.id === id);
    if (index < tasks.length - 1) {
      const updatedTasks = [...tasks];
      [updatedTasks[index], updatedTasks[index + 1]] = [
        updatedTasks[index + 1],
        updatedTasks[index],
      ];
      setTasks(updatedTasks);
    }
  }

  return (
    <>
    <Header />
      <div className="bg-slate-400 justify-center mx-auto">
        <h1>Tasks</h1>
        <div>
          <div className="flex flex-row justify-center gap-10 p-5" >
            <div className="flex flex-col">
              <label htmlFor="new_task">Task Title:</label>
                <input
                  type="text"
                  placeholder="Enter title"
                  value={newTask}
                  onChange={handleInputChange}
                />
            </div>

            <div className="flex flex-col">
              <label htmlFor="task_description">Task Description:</label>
              <textarea placeholder="Type description here..." name="task_description" required/>
            </div>

            <div className="mx-auto text-center justify-center pb-5">
            <button type="submit" className="bg-orange-300 rounded p-4" onClick={createTask}>Create Task</button>
            </div>

          </div>
        </div>

        <ol>
          {tasks.map((task) => (
            <li key={task.id}>
              <span className="text">{task.text}</span>
              <button
                className="delete-button"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
              <button
                className="move-button"
                onClick={() => moveTaskUp(task.id)}
              >
                Up
              </button>
              <button
                className="move-button"
                onClick={() => moveTaskDown(task.id)}
              >
                Down
              </button>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
