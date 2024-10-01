import { useEffect, useState } from 'react';
import { Header, TaskCard } from './misc';
import { filterTasksByUser, getTaskByID } from '../api/tasks';
import { TaskProps } from '../interfaces/tasks_types';
import { useAuth } from '../App';
import { Back_Button } from './Buttons';
import { Link, useParams } from 'react-router-dom';
import { TaskForm, UpdateTask } from './TaskForm';
//To prevent errors; assigns properties to the tasks to maintain consistency

//*TODO:
// - Maybe filter out employees who aren't assigned to that project?

export function Tasks() {
  return (
    <>
      <Header />
      <h1 className="mx-4 text-x1 font-semibold">Assign Task</h1>

      <TaskForm />
    </>
  )
}

export function EditTask() {
  const { id } = useParams<string>()

  if (!id) {
    return <div>Loading...</div>
  }

  const [task_data, setTaskData] = useState<TaskProps>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const task = await getTaskByID(id)

        if (!task) {
          throw new Error("Error fetching task data")
        }

        console.log("task", task)

        setTaskData(task)
      }
      catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [id])
  
  return (
    <>
      <Header />
      <h1 className="mx-4 text-x1 font-semibold">Edit Task</h1>

      {task_data && <UpdateTask task_data={task_data}/>}
    </>
  )
}

export function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const get_tasks = await filterTasksByUser(user?.email as string);
        setTasks(get_tasks);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [user?.email])
  return (
    <>
      <Header/>
      <h1 className="mx-4 text-x1 font-semibold">Task List</h1>

      <div className='grid grid-cols-4 mx-5'>
        {tasks && tasks.map((task) => (
          <Link to={'/tasks/edit_task/' + task.task_id} key={task.task_id}>
            <TaskCard task={task} />
          </Link>
        ))}
      </div>

      <div className="flex justify-center">
        <Back_Button/>
      </div>
    </>
  );
}