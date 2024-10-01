import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { SelectionComponentProps } from "../interfaces/button_types";

/** General Orange button */
export function Route_Button({route, text, isDelete}: {route: string, text: string, isDelete?: boolean}) {
    const navigate = useNavigate();
    const css = isDelete ? 'bg-red-300 rounded p-4 my-2 hover:bg-red-400 transition' : 
    'bg-orange-300 rounded p-4 my-2 hover:bg-orange-400 transition';
  
    return(
      <button className={css} onClick={() => navigate(route)}>{text}</button>
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

export function OrangeButton({children, onClick}: {children: React.ReactNode, onClick?: () => void}){
    return (
        <button className="bg-orange-300 rounded px-4 py-2 ml-5 transition hover:bg-orange-400" onClick={onClick}>
            {children}
        </button>
    )
}

/**
 * For use in both the CreateProjectForm and UpdateProjectForm components
 *  
 * There are two buttons: One that goes back to the main menu and one that creates or updates a project
 * 
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

export function CreateableSelectionComponent({Value = '', multiple, options, name, onChange}: SelectionComponentProps){
    if (!options) {
        options = [{value: '', label: ''}];
    }
        
    const defaultOption = options.find((option) => option.value === Value)
    // Sets default to the defaultOption if it exists
    // if not, uses DefaultValue
    const selectDefaultValue = defaultOption
        ? defaultOption
        : {value: Value, label: Value}

    return (
        <CreatableSelect value={selectDefaultValue} options={options} name={name} placeholder="Search" isMulti={multiple} onChange={onChange} 
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

export function SelectionComponent({Value: defaultValue = '', multiple, options, name, onChange}: SelectionComponentProps){
    if (!options) {
        options = [{value: '', label: ''}];
        console.error("No options found for", name)
    }

    const defaultOption = options.find((option) => option.value === defaultValue)
    
    // This one is specifically for the manager (getting the email for defaultmanager)
    const defaultOptionValue = options.find((option) => option.label === defaultValue)?.value

    // If the default option value is not found, it will be undefined
    // This would cause an error if the manager's email is not found
    if (!defaultOptionValue) {
        // Kinda annoying to see in the console
        //console.warn("No default option value found for", name, "with options", options)
    }
    
    // Sets default to the defaultOption if it exists
    // if not, uses DefaultValue
    const selectDefaultValue = defaultOption
    ? defaultOption
    : {value: defaultOptionValue ? defaultOptionValue : defaultValue, label: defaultValue}

    return (
        <Select value={selectDefaultValue} onChange={onChange} options={options} name={name} placeholder="Search" isMulti={multiple} 
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