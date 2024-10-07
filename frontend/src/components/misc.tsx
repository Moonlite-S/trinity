// For miscelaneous components
import {useNavigate } from 'react-router-dom';
import logo from '/trinity_logo.png'
import { TaskProps } from '../interfaces/tasks_types';
import { AnnouncementProps } from '../interfaces/announcement_types';
import { ProjectProps } from '../interfaces/project_types';
import { useMemo, useState } from 'react';
import DataTable, { Direction, TableColumn } from 'react-data-table-component';

// Header Component for all pages
export function Header() {
  const navigate = useNavigate();

  return(
    <header className='w-full h-32 relative'>

      <div className='h-4 w-full bg-orange-400 absolute -z-10' />

      <img src={logo} alt='Trinity MEP Logo' className="h-32 cursor-pointer" onClick={() => navigate('/main_menu')}/>

    </header>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function Error_Component({ errorString }: { errorString: string }) {
  return (
      <div className="justify-center mx-auto p-5 bg-red-500">
          <p className="text-white">{errorString}</p>
      </div>
  )
}

/**
 * TaskCard Component
 * 
 * @param task - The task to be displayed
 * @returns A card displaying the task's details
 * 
 * TODO:
 * - Add the person who created the task
 */
export function TaskCard ({task} : {task: TaskProps}) {
    // The project_id is using the __str__ representation of the object
    // So i just need to split to get the project name and company name
    const formatProjectName = task.project_id.split('|')[1]

    return (
    <div className=" bg-slate-100 p-4 my-4 mx-2 rounded-md shadow-md">
        <h3 className='font-bold'>{task.title}</h3> 
        <h4>From Project: {formatProjectName}</h4>
        <p className="py-4 break-words">{task.description}</p>
        <p className="text-red-800">Due: {task.due_date}</p>
    </div>
    )
}

export function AnnouncementCard({announcement} : {announcement: AnnouncementProps}) {
    return (
    <div className="bg-slate-100 p-2 my-4 mx-2 rounded-md shadow-md">
        <h3>{announcement.title}</h3>
        <p>{announcement.content}</p>
        <p>{announcement.author}</p>
    </div>
    )
}

export function ProjectCard ({project} : {project: ProjectProps}) {
  const manager = typeof project.manager === 'string' ? project.manager : project.manager.name
  return (
  <div className="bg-slate-100 p-2 my-4 mx-2 rounded-md shadow-md">
      <h3>{project.project_name}</h3>
      <h4>Current Manager: {manager}</h4>
      <p>Client: {project.client_name}</p>
      <p className="py-4">Notes: {project.description ? project.description : '(No Notes Written)'}</p>
      <p className="text-red-800">Next Deadline: {project.end_date}</p>
  </div>
  )
}

/**
 * This function handles the api method at the end of the form
 * @param create_fn corresponds to the POST method
 * @param edit_fn corresponds to the PUT method
 * @param close_fn corresponds to the CLOSE method
 * 
 * @returns An API call function from their respective files
 */

export function MethodHandler(method: "POST" | "PUT" | "CLOSE" , create_fn: Function, update_fn: Function, close_fn: Function): Function {
  if (method === "POST"){
      return create_fn
  }
  else if (method === "PUT"){
      return update_fn
  } 
  else if (method === "CLOSE"){
    return close_fn
  }
  throw new Error("Invalid method: Received " + method)
}

type GenericTableProps<T> = {
  dataList: T[]
  isDataLoaded: boolean
  columns: TableColumn<T>[]
  FilterComponent: React.ComponentType<{ filterText: string; onFilter: (e: any) => void; onClear: () => void }>
  expandableRowComponent: React.ComponentType<{ data: T }>
  filterField: string
}

/**
 * The Univseral Table Component
 * 
 * (You still need to create the FilterComponent and expandableRowComponent your)
 * 
 * @param projectList - List of projects 
 * @param projectLoaded - Boolean to check if projects have been loaded
 */
export function GenericTable<T>({ dataList, isDataLoaded, columns, FilterComponent, expandableRowComponent, filterField }: GenericTableProps<T>) {
  const [filterText, setFilterText] = useState<string>('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState<boolean>(false)

  // Filter the data based on the filterField
  const filteredData: T[] = dataList.filter((item: T) => {
    const fieldValue = item[filterField as keyof T];
    return typeof fieldValue === 'string' ? fieldValue.toLowerCase().includes(filterText.toLowerCase()) : true;
  });

  // For the filter function
  const filterSearchBox = useMemo(() => {
      const handleClear = () => {
          if (filterText) {
              setResetPaginationToggle(!resetPaginationToggle);
              setFilterText('')
          }
      }

      return (
          <FilterComponent onFilter={(e: any) => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} />

      )
  }, [filterText, resetPaginationToggle])

  return(
      <DataTable
      columns={columns}
      data={filteredData}
      direction={Direction.AUTO}
      progressPending={!isDataLoaded}
      subHeaderComponent={filterSearchBox}
      expandableRowsComponent={expandableRowComponent}
      paginationResetDefaultPage={resetPaginationToggle}
      persistTableHead
      highlightOnHover
      expandableRows
      selectableRows
      pagination
      subHeader
      />        
  )
}