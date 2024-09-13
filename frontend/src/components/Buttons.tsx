import { SelectionComponentProps } from "../interfaces/project_types";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

/** General Orange button */
export function Route_Button({route, text, isDelete}: {route: string, text: string, isDelete?: boolean}) {
    const navigate = useNavigate();
    const css = isDelete ? 'bg-red-300 rounded p-4 my-2 hover:bg-red-400 transition' : 
    'bg-orange-300 rounded p-4 my-2 hover:bg-orange-400 transition';
  
    return(
      <button className={css} onClick={() =>navigate(route)}>{text}</button>
    )
  }
  
/** Goes back a page in the browser */
export function Back_Button() {
const navigate = useNavigate();
const css = 'bg-orange-300 rounded p-4 my-2 hover:bg-orange-400 transition'

return(
    <button type="button" className={css} onClick={() => navigate(-1)}>Back</button>
)
}

/**
 * For use in both the CreateProjectForm and UpdateProjectForm components
 *  
 * There are two buttons: One that goes back to the main menu and one that creates or updates a project
 * 
 * @params button_text The text of the second button (Either "Create Project" or "Update Project")
 * @params route The route of the back button (Either "/main_menu" or "/update_project")
 * This is usually either "Create Project" or "Update Project"
 */
export function BottomFormButton({ button_text }: { button_text: string}) {
    return (
    <div className="mx-auto text-center justify-center pt-5">

        <Back_Button/>
        
        <button type="submit" className="bg-orange-300 rounded p-4 ml-5">
            {button_text}
        </button>

    </div>
    );
}

export function CreateableSelectionComponent({defaultValue = '', multiple, options, name}: SelectionComponentProps){
    if (!options) {
        options = [{value: '', label: ''}];
    }
        
    const defaultOption = options.find((option) => option.value === defaultValue)
    // Sets default to the defaultOption if it exists
    // if not, uses DefaultValue
    const selectDefaultValue = defaultOption
        ? defaultOption
        : {value: defaultValue, label: defaultValue}

    return (
        <CreatableSelect defaultValue={selectDefaultValue} options={options} name={name} placeholder="Search" isMulti={multiple} isClearable 
        styles = {{
            control: (baseStyles: any, state: any) => ({
                ...baseStyles,
                borderColor: state.isFocused ? 'orange' : 'gray',
                boxShadow: state.isFocused ? '0 0 0 2px orange' : 'none',
                '&:hover': {
                    borderColor: state.isFocused ? 'orange' : 'gray',
                },
            }),
            option: () => ({
                padding: '5px 10px',
                rounded: '5px',
                '&:hover': {
                    backgroundColor: '#cacacc',
                },
            })
        }}/>
    )
}

export function SelectionComponent({defaultValue = '', multiple, options, name, onChange}: SelectionComponentProps){
    if (!options) {
        options = [{value: '', label: ''}];
    }

    const defaultOption = options.find((option) => option.value === defaultValue)

    // Sets default to the defaultOption if it exists
    // if not, uses DefaultValue
    const selectDefaultValue = defaultOption
        ? defaultOption
        : {value: defaultValue, label: defaultValue}
    return (
        <Select defaultValue={selectDefaultValue} onChange={onChange ? onChange : () => {}} options={options} name={name} placeholder="Search" isMulti={multiple} isClearable 
        styles = {{
            control: (baseStyles: any, state: any) => ({
                ...baseStyles,
                borderColor: state.isFocused ? 'orange' : 'gray',
                boxShadow: state.isFocused ? '0 0 0 2px orange' : 'none',
                '&:hover': {
                    borderColor: state.isFocused ? 'orange' : 'gray',
                },
            }),
            option: () => ({
                padding: '5px 10px',
                rounded: '5px',
                '&:hover': {
                    backgroundColor: '#cacacc',
                },
                
            })

        }}/>
    )
}