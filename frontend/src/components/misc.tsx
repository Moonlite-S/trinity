// For miscelaneous components
import {useNavigate } from 'react-router-dom';
import logo from '/trinity_logo.png'
import { TaskProps } from '../interfaces/tasks_types';
import { AnnouncementProps } from '../interfaces/announcement_types';
import { ProjectProps } from '../interfaces/project_types';

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
    const formatCompanyName = task.project_id.split('|')[2]

    return (
    <div className=" bg-slate-100 p-4 my-4 mx-2 rounded-md shadow-md">
        <h3>{formatProjectName}</h3>
        <h4 className='font-bold'>Task: {task.title}</h4> 
        <p className="py-4 break-words">{task.description}</p>
        <p className="text-red-800">Due: {task.due_date}</p>
        <p>From Project: {formatCompanyName}</p>
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