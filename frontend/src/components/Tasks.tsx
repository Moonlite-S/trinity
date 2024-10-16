import { useEffect, useState } from 'react';
import { GenericTable, Header } from './misc';
import { deleteTask, filterTasksByAllUserProjects, getTaskByID, getTaskList } from '../api/tasks';
import { TaskProps } from '../interfaces/tasks_types';
import { useParams } from 'react-router-dom';
import { TaskForm } from './TaskForm';
import { OrangeButton, RouteButton } from './Buttons';
import { useAuth } from '../App';
import { EmployeeProps } from '../interfaces/employee_type';
import { getProject } from '../api/projects';

/**
 *  ### Route for ('/tasks/create_task')
 * 
 */
export function CreateTask() {
  return (
    <>
      <Header />
      <h1 className="mx-4 text-x1 font-semibold">Assign Task</h1>

      <TaskForm method="POST" />
    </>
  )
}

/**
 *  ### Route for ('/tasks/update_task/:id')
 * 
 * 
 */
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

        setTaskData({...task, task_id: id})
      }
      catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [id])
  
  return (
    <>
      <Header />
      <h1 className="mx-4 text-x1 font-semibold">Edit Task</h1>

      {task_data && <TaskForm task_data={task_data} method="PUT"/>}
    </>
  )
}

/**
 *  ### Route for ('/tasks/create_task_from_project')
 * 
 *  This is a seperate route for creating a task from a project card
 */
export function CreateTaskFromProject(){
  const { id } = useParams<string>()
  if (!id) {
    return <div>Loading...</div>
  }

  const [task_data, setTaskData] = useState<TaskProps>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const project = await getProject(id)

        if (!project) {
          throw new Error("Error fetching task data")
        }

        // I need it in this format because the TaskForm find the project in this format...
        // Yet another hacky solution...
        const string_format = "ID: " + project.project_id + " | Name: " + project.project_name

        setTaskData({
          task_id: "",
          project: project.project_name,
          title: "",
          description: "",
          assigned_to: "",
          project_id: string_format,
          due_date: new Date().toLocaleDateString('en-CA'),
          status: "ACTIVE",
          completion_percentage: 0
        })
      }
      catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [id])

  return (
    <>
      <Header />
      <h1 className="mx-4 text-x1 font-semibold">Create Task</h1>

      {task_data && <TaskForm task_data={task_data} method="POST"/>}
    </>
  )
}

/**
 *  ### Route for ('/tasks/')
 * 
 * 
 */
export function TaskList() {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }
  
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === "Administrator" || user.role === "Manager") {
          const get_tasks = await getTaskList();
          setTasks(get_tasks);
          setTasksLoaded(true)
        } else {
          const get_tasks = await filterTasksByAllUserProjects(user.email);
          setTasks(get_tasks);
          setTasksLoaded(true)
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [])

  const columns = [
    { name: "Title", selector: (row: TaskProps) => row.title },
    { name: "Assigned To", selector: (row: TaskProps) => row.assigned_to.split('|')[0] },  // Uses the __str__ representation of the employee object
    { name: "Project", selector: (row: TaskProps) => row.project_id.split('|')[1] },  // Uses the __str__ representation of the project object (Yeah I don't lke this either)
    { name: "Due Date", selector: (row: TaskProps) => row.due_date },
    { name: "Status", selector: (row: TaskProps) => row.status,
      conditionalCellStyles: [
        { when: (row: TaskProps) => row.status === "ACTIVE", style: { backgroundColor: '#FFCCCC' } },
        { when: (row: TaskProps) => row.status === "CLOSING", style: { backgroundColor: '#FFEE99' } },
        { when: (row: TaskProps) => row.status === "COMPLETED", style: { backgroundColor: '#90EE90' } },
    ]
     }
  ];
  
  return (
    <>
      <Header/>
      <h1 className="mx-4 text-x1 font-semibold">Tasks</h1>

      {tasksLoaded && <GenericTable
        dataList={tasks}
        isDataLoaded={tasksLoaded}
        columns={columns}
        FilterComponent={FilterComponent}
        expandableRowComponent={({data}) => expandableRowComponent({data: data, user: user})}
        filterField="title"
      />}
    </>
  );
}

function FilterComponent({ filterText, onFilter, onClear }: { filterText: string, onFilter: (e: any) => void, onClear: () => void }) {
    return (
        <div className="flex flex-row gap-2 ">
            <input type="text" placeholder="Filter by Submittal ID" value={filterText} onChange={onFilter} className='bg-slate-100 rounded-md p-2' />
            <button onClick={onClear}>Clear</button>
        </div>
    )
}

function expandableRowComponent({ data, user }: { data: TaskProps, user: EmployeeProps }) {
  const handleDelete = async () => {
      if (confirm("Are you sure you want to delete this task?")) {
          try {
              if (!data.task_id) {
                  throw new Error("Task ID is undefined");
              }
              const response = await deleteTask(data.task_id);
              if (response === 200) {
                  alert("Task deleted successfully");
                  window.location.reload();
              } else {
                  alert("Error deleting task:" + response);
              }
          } catch (error) {
              alert("Error deleting task:" + error);
          }
      }
  };

  return (
      <div>
        <div className="flex flex-col gap-2 px-2">
          <h2 className='font-semibold'>Description:</h2>
          <p>{data.description}</p>
        </div>
        <div className="px-2 flex flex-row gap-2">
          <RouteButton text="Edit Task" route={`/tasks/update_task/${data.task_id}`}/>
          {user.role === "Manager" || user.role === "Administrator" && <OrangeButton onClick={handleDelete}>Delete Task</OrangeButton>}
        </div>
      </div>
  )
} 
