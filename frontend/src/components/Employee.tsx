import { deleteEmployee, getAllEmployeeData, getEmployeeDataById } from "../api/employee"
import { Header } from "./misc"
import { useEffect, useMemo, useState } from "react"
import DataTable, { Direction, TableColumn } from "react-data-table-component"
import { EmployeeProps, FilterProps } from "../interfaces/employee_type"
import { OrangeButton, RouteButton } from "./Buttons"
import { EmployeeForm } from "./EmployeeForm"
import { useParams } from "react-router-dom"

/**
 *  ### [Route for ('/create_employee')]
 * 
 * Create an employee and sends a POST request to the backend
 */
export function CreateEmployee() {
    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>Create Employee</h1>
            </div>

            <EmployeeForm method="POST"/>
        </>
    )
}

export function UpdateEmployee() {
    const { id } = useParams()
    if (!id) {
        console.error("No employee selected")
        return <div>No employee selected</div>
    }
    const [employeeData, setEmployeeData] = useState<EmployeeProps>()

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const response = await getEmployeeDataById(id)
                setEmployeeData({...response, id: id})
            } catch (error) {
                console.error("Error fetching employee data:", error)
            }
        }

        fetchEmployeeData()
    }, [id])

    console.log("Employee Data: ", employeeData)

    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>Update Employee</h1>
            </div>
            
            {employeeData && <EmployeeForm method="PUT" employee={employeeData as EmployeeProps}/>}
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
                console.error("Error fetching employees:", error)
                throw error // Re-throw the error so the caller can handle it if needed
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
const ExpandableRowComponent = ({ data }: { data: EmployeeProps }) => {
    const deleteEmployeeFunc = async (id: string) => {
        if (confirm("Are you sure you want to delete this employee?") && confirm("Are you really sure?")) {
        try {
            const response = await deleteEmployee(id)
            if (response === 204) {
                alert("Employee deleted successfully")
                window.location.reload()
            } else {
                throw new Error("Error deleting employee")
            }
        } catch (error) {
            console.error("Error deleting employee:", error)
            throw error
            }
        }
    }
    
    return (
    <div className="flex flex-col gap-5 bg-slate-50">
        <div className="flex flex-row gap-5 m-5">
            <RouteButton route={"/employees/update_employee/" + data.id} text="Edit"/>
            <OrangeButton onClick={() => deleteEmployeeFunc(data.id as string)}>Delete</OrangeButton>
        </div>
    </div>
    )
}

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
    const [resetPaginationToggle, setResetPaginationToggle] = useState<boolean>(false)

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
                setResetPaginationToggle(!resetPaginationToggle)
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
