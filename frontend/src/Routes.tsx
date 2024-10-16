import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { MainMenu } from './components/MainMenu'
import Home from './components/Home'
import { CreateProject, UpdateProject, UpdateProjectList, ProjectStatusReport } from './components/Project'
import { CreateTask, CreateTaskFromProject, TaskList } from './components/Tasks';
import { CreateEmployee, EmployeeList, UpdateEmployee } from './components/Employee'
import { TemplateList } from './components/Template'
import { ErrorPage } from './components/Error'
import { MonthlyCalendar, WeeklyCalendar } from './components/Calendar';
import { SetAnnouncement } from './components/Announcement'
import CreateSubmittal, { EditSubmittal, SubmittalList } from './components/Submittal'
import { EditTask } from './components/Tasks'
import ViewRFI, { CreateRFI, EditRFI } from './components/RFI'
import ProposalList from './components/Proposal'
import { ViewInvoices, EditInvoice } from './components/Invoice'
import { PasswordReset } from './auth/PasswordReset'
import { EmailConfirmation } from './auth/VerifyEmail'
import { Changelog } from './components/Changelog'
import { Verification } from './App'

export function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Home />} />

            {/* All routes here are checked for authentication. */}
            <Route element={<Verification />}>
              <Route path='/main_menu' element={<MainMenu/>} />

              <Route path='/projects/' element={<UpdateProjectList />} />
              <Route path='/projects/create_project' element={<CreateProject />} />
              <Route path='/projects/update_project/:id' element={<UpdateProject />} />
              <Route path='/projects/project_status_report' element={<ProjectStatusReport />} />

              <Route path='/tasks/create_task' element={<CreateTask />} />
              <Route path='/tasks/update_task/:id' element={<EditTask />} />
              <Route path='/tasks/' element={<TaskList />} />
              <Route path='/tasks/create_task_from_project/:id' element={<CreateTaskFromProject />} />
              
              <Route path='/submittals/create_submittal' element={<CreateSubmittal />} />
              <Route path='/submittals/' element={<SubmittalList />} />
              <Route path='/submittals/update_submittal/:id' element={<EditSubmittal />} />

              <Route path='/employees/' element={<EmployeeList />} />
              <Route path='/employees/create_employee' element={<CreateEmployee />} />
              <Route path='/employees/update_employee/:id' element={<UpdateEmployee />} />
              <Route path='/template_list/' element={<TemplateList />} />
              <Route path='/monthly_calendar' element={<MonthlyCalendar />} />
              <Route path='/weekly_calendar' element={<WeeklyCalendar />} />

              <Route path='/rfi/' element={<ViewRFI />} />
              <Route path='/rfi/create_rfi' element={<CreateRFI />} />
              <Route path='/rfi/update_rfi/:id' element={<EditRFI />} />
              <Route path='/announcements/create_anncouncement' element={<SetAnnouncement />} />

              <Route path='/invoices/update_invoice/:id' element={<EditInvoice />} />
              <Route path='/invoices/' element={<ViewInvoices />} />

              <Route path='/proposal/' element={<ProposalList />} />

              <Route path='/changelog/' element={<Changelog />} />
            </Route>

            <Route path='/email/confirm/:key' element={<EmailConfirmation />} />
            <Route path='/password/reset/:key' element={<PasswordReset />} />

            <Route path='*' element={<ErrorPage />} />
            </Routes>
        </Router>
    )
}