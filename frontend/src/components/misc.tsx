// For miscelaneous components
import {useNavigate } from 'react-router-dom'
import logo from '/trinity_logo.png'
import { useMemo, useState } from 'react'
import DataTable, { Direction, TableColumn } from 'react-data-table-component'

// Header Component for all pages
export function Header() {
  const navigate = useNavigate()

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
 * ## Component for opening a folder in the file explorer
 * 
 * Default color is blue
 * 
 * @param folder_path - The path to the folder to be opened
 * @returns A button that opens the folder in the file explorer
 */
export function OpenFolderButton({ folder_path }: { folder_path: string }) {
  return (
    <a href={'localexplorer:L:\\' + folder_path}>
      <button className="bg-blue-300 rounded p-4 my-2 hover:bg-blue-400 transition">Open Folder</button>
    </a>
  )
}

/**
 * This function handles the api method at the end of the form
 * @param create_fn corresponds to the POST method
 * @param edit_fn corresponds to the PUT method
 * 
 * @returns An API call function from their respective files
 */

export function MethodHandler(method: "POST" | "PUT" , create_fn: Function, update_fn: Function): Function {
  if (method === "POST"){
      return create_fn
  }
  else if (method === "PUT"){
      return update_fn
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
 * (You still need to create the FilterComponent and expandableRowComponents)
 * 
 * @param dataList - List of data to be displayed
 * @param isDataLoaded - Boolean to check if data has been loaded
 * @param columns - The columns to be displayed
 * @param FilterComponent - The component to be used for the filter
 * @param expandableRowComponent - The component to be used for the expandable row
 * @param filterField - The field to be used for the filter
 */
export function GenericTable<T>({ dataList, isDataLoaded, columns, FilterComponent, expandableRowComponent, filterField }: GenericTableProps<T>) {
  const [filterText, setFilterText] = useState<string>('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState<boolean>(false)

  // Filter the data based on the filterField
  const filteredData: T[] = dataList.filter((item: T) => {
    const fieldValue = item[filterField as keyof T]
    return typeof fieldValue === 'string' ? fieldValue.toLowerCase().includes(filterText.toLowerCase()) : true
  })

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