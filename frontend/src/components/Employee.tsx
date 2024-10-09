import { useNavigate } from "react-router-dom";
import { createEmployee, getAllEmployeeData } from "../api/employee";
import { Header } from "./misc";
import { useEffect, useMemo, useState } from "react";
import DataTable, { Direction, TableColumn } from "react-data-table-component";
import { EmployeeProps, FilterProps } from "../interfaces/employee_type";
import { RouteButton } from "./Buttons";

/**
 *  ### [Route for ('/create_employee')]
 * 
 * Create an employee and sends a POST request to the backend
 * 
 */
export function CreateEmployee() {
    const [errorString, setErrorString] = useState<string>("")
    const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const navigate = useNavigate();

    const onSubmit = async(e: any) => {
        e.preventDefault()
        
        setErrorString("")

        if (e.target.password.value !== e.target.re_password.value) {
            setErrorString("Passwords do not match.")
            return
        } else if (!email_regex.test(e.target.email.value)) {
            setErrorString("Invalid email.")
            return
        }

        try {
            const code = await createEmployee({
                name: e.target.name.value,
                email: e.target.email.value,
                password: e.target.password.value,
                username: e.target.name.value,
                role: e.target.role.value,
                
            })

            if (code === 200) {
                alert("Employee created successfully!")
                navigate("/main_menu")
            } else if (code === 403) {
                setErrorString("Not Authorized to create Employee. Please contact the admin. Error code: " + code)
            } else {
                setErrorString("Employee creation failed! Error code: " + code)
            }

        } catch (error) {
            console.error("Error creating employee:", error);
            setErrorString("Network Error. Employee was not created.")
            throw error; // Re-throw the error so the caller can handle it if needed
        }
    }

    return (
        <>
        <Header />

        <div className="px-5">

            <h1 className="text-center">Create Employee Form:</h1>
            <form id="project_creation" onSubmit={onSubmit}  method="post">

                <div className="grid grid-cols-2 gap-5 p-24 mx-auto max-w-screen-lg bg-zinc-50 mt-5" >

                    <div className="grid grid-cols-2 gap-3 justify-center">

                        <label htmlFor="name">Name:</label>
                        <input type="text" name="name" className="bg-slate-100 border border-zinc-300" required/>

                        <label htmlFor="name">Email:</label>
                        <input type="text" name="email"  className="bg-slate-100 border border-zinc-300" required/>

                    </div>

                    <div className="grid grid-cols-2 gap-3 justify-center">

                        <label htmlFor="name">Password:</label>
                        <input type="password" name="password" className="bg-slate-100 border border-zinc-300" required/>

                        <label htmlFor="name">Re-enter Password:</label>
                        <input type="password" name="re_password" className="bg-slate-100 border border-zinc-300" required/>

                    </div>

                    <div className="grid grid-cols-2 gap-3 justify-center">

                        <label htmlFor="name">Role:</label>
                        <select name="role" className="bg-slate-100 border border-zinc-300" required>
                            <option value="Manager">Manager</option>
                            <option value="Employee">Team Member</option>
                            <option value="Accountant">Accountant</option>
                        </select>

                    </div>

                </div>

                <div className="flex flex-row justify-center gap-3 m-2">

                    <RouteButton route={"/main_menu"} text="Back"/>

                    <button type="submit" className="bg-orange-300 rounded p-4 m-2">
                        <h6 className="inline-block">Submit</h6>    
                    </button>

                </div>

                <div className="mt-5">
                    {errorString && <p className="text-red-500 text-center">{errorString}</p>}
                </div>

            </form>
        </div>
        </>
    )
}

/**
 * ### [Route for ('/employee')]
 * 
 * Lists all the employees in the database
 * 
 */
export function EmployeeList() {
    const [employeeList, setEmployeeList] = useState<EmployeeProps[]>([])
    const [listLoaded, setListLoaded] = useState<boolean>(false)

    useEffect(() => {
        const getEmployees = async () => {
            try {
                const response = await getAllEmployeeData()
                setEmployeeList(response as EmployeeProps[])
                setListLoaded(true)
            } catch (error) {
                console.error("Error fetching employees:", error);
                throw error; // Re-throw the error so the caller can handle it if needed
            }}

        getEmployees()
    }, [])

    return (
        <>
            <Header />

            <EmployeeUpdateTable employeeList={employeeList} employeeLoaded={listLoaded}/>

            <div className="flex flex-row justify-center gap-3 m-2">
                <RouteButton route={"/main_menu"} text="Back"/>
            </div>
        </>
    )
}

/**
 * Helper Component for ProjectUpdateTable
 * 
 * This is the filter bar at the top of the table
 * 
 * At some point, we'll implement the vector search here maybe
 */
const FilterComponent = ({ filterText, onFilter, onClear }: FilterProps) => (
    <>
        <input
         id="search"
         type="text"
         placeholder="Filter..."
         aria-label="Search input"
         value={filterText}
         onChange={onFilter}
         className="bg-slate-100 px-4 py-2"
         />

        <button className="bg-orange-200 rounded px-4 py-2 ml-5 transition hover:bg-orange-300" type="button" onClick={onClear}>
            X
        </button>
    </>
)

/**
 * A Component that shows when the user clicks on a row on the table.
 * 
 * This is where the description of the project will be stored
 * 
 * But also I want buttons to see a report or edit the project
 * 
 * @param param0 data The props of a give row
 * 
 */
const ExpandableRowComponent = ({ data }: { data: EmployeeProps }) => (
    <div className="flex flex-col gap-5 bg-slate-50">
        <div className="flex flex-row gap-5 m-5">
            <RouteButton route={"/employees/update_employee/" + data.id} text="Edit"/>
            <RouteButton route={"/employees/delete/" + data.id} text="Delete" isDelete/>
        </div>
    </div>
)

/**
 * The Table Component that lists the employees
 * 
 * Basically the same as the one in the Projects page.
 * 
 * Features sorting by any field, and filtering by Name currently.
 * 
 * @param employeeList - List of projects 
 * @param employeeLoaded - Boolean to check if projects have been loaded
 */
function EmployeeUpdateTable({ employeeList, employeeLoaded }: { employeeList: EmployeeProps[], employeeLoaded: boolean }) {
    const [filterText, setFilterText] = useState<string>('')
    const [resetPaginationToggle, setResetPaginationToggle] = useState<boolean>(false);

    const filteredProjects: EmployeeProps[] = employeeList.filter(item => item.name.toLowerCase().includes(filterText.toLowerCase()))

    // Column Names
    const columns: TableColumn<EmployeeProps>[] = [
        { name: "ID", selector: row => row.id ?? "", sortable: true },
        { name: "Name", selector: row => row.name, sortable: true },
        { name: "E-mail", selector: row => row.email, sortable: true },
        { name: "Role", selector: row => row.role, sortable: true },
        { name: "Date Joined", selector: row => row.date_joined ?? "", sortable: true },
    ]

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
        title="Employee List"
        columns={columns}
        data={filteredProjects}
        direction={Direction.AUTO}
        progressPending={!employeeLoaded}
        subHeaderComponent={filterSearchBox}
        expandableRowsComponent={ExpandableRowComponent}
        paginationResetDefaultPage={resetPaginationToggle}
        persistTableHead
        highlightOnHover
        selectableRows
        expandableRows
        pagination
        subHeader
        />        
    )
}
