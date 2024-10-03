import { useEffect, useState } from 'react';
import { GenericTable, Header } from './misc';
import { getTaskByID, getTaskList } from '../api/tasks';
import { TaskProps } from '../interfaces/tasks_types';
import { useParams } from 'react-router-dom';
import { TaskForm, UpdateTask } from './TaskForm';

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
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const get_tasks = await getTaskList();
        setTasks(get_tasks);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [])

  const columns = [
    {
      name: "Title",
      selector: (row: TaskProps) => row.title,
    },
    {
      name: "Description",
      selector: (row: TaskProps) => row.description,
    },
  ];
  
  return (
    <>
      <Header/>
      <h1 className="mx-4 text-x1 font-semibold">Tasks</h1>

      <GenericTable
        dataList={tasks}
        isDataLoaded={true}
        columns={columns}
        FilterComponent={FilterComponent}
        expandableRowComponent={expandableRowComponent}
        filterField="title"
      />
    </>
  );
}

function FilterComponent({ filterText, onFilter, onClear }: { filterText: string, onFilter: (e: any) => void, onClear: () => void }) {
    return (
        <div className="flex flex-row gap-2">
            <input type="text" placeholder="Filter by Submittal ID" value={filterText} onChange={onFilter} />
            <button onClick={onClear}>Clear</button>
        </div>
    )
}

function expandableRowComponent({ data }: { data: TaskProps }) {
    return (
        <div>
            <p>{data.title}</p>
        </div>
    )
} 
