import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { Link, useNavigate } from "react-router-dom";
import { SelectionComponentProps } from "../interfaces/button_types";

/** General Orange button */
export function RouteButton({route, text}: {route: string, text: string}) {
    const css = 'bg-orange-300 rounded p-4 my-2 hover:bg-orange-400 transition';
  
    return(
      <Link className={css} to={route}>{text}</Link>
    )
}
  
/** Goes back a page in the browser */
export function BackButton() {
    const navigate = useNavigate();
    const css = 'bg-orange-300 rounded p-4 my-2 hover:bg-orange-400 transition'

    return(
        <button type="button" className={css} onClick={() => navigate(-1)}>Back</button>
    )
}

export function OrangeButton({children, onClick}: {children: React.ReactNode, onClick?: () => void}){
    return (
        <button type="button" className="bg-orange-300 rounded p-4 my-2 hover:bg-orange-400 transition" onClick={onClick}>
            {children}
        </button>
    )
}

/**
 * For use in both the CreateProjectForm and UpdateProjectForm components
 *  
 * There are two buttons: One that goes back a page and one that creates or updates a project
 * 
 * Optional: @param children prop to add a button next to the other two (You might want to use OrangeButton for this)
 * 
 * Remember to supply an onClick function for the children button
 */
export function BottomFormButton({ button_text, children }: { button_text: string, children?: React.ReactNode}) {
    return (
    <div className="mx-auto text-center justify-center pt-5 gap-5 flex">

        <BackButton/>
        
        <button type="submit" className="bg-orange-300 rounded p-4 my-2 hover:bg-orange-400 transition">
            {button_text}
        </button>

        {children}

    </div>
    );
}

export function CreateableSelectionComponent({Value = '', multiple, options, name, onChange, label}: SelectionComponentProps){
    if (!options) {
        options = [{value: '', label: ''}];
    }
        
    const defaultOption = options.find((option) => option.value === Value)
    
    // Sets default to the defaultOption if it exists
    // if not, uses DefaultValue
    const selectDefaultValue = defaultOption
        ? defaultOption
        : {value: Value, label: Value}


    if (Value !== '') {
        options.splice(options.indexOf({value: Value, label: Value}), 1)
    }

    return (
        <div className="flex flex-col justify-between">
            <label data-testid={name} id={`${name}-label`} htmlFor={name} className="py-2">{label}</label>
            <CreatableSelect 
            inputId={name} 
            aria-labelledby={`${name}-label`} 
            value={selectDefaultValue} 
            options={options} 
            name={name} 
            placeholder="Search" 
            isMulti={multiple} 
            onChange={onChange} 
            classNamePrefix="react-select"
            styles = {{
                control: (baseStyles: any, state: any) => ({
                    ...baseStyles,
                    borderColor: state.isFocused ? 'orange' : 'gray',
                    boxShadow: state.isFocused ? '0 0 0 2px orange' : 'none',
                    minWidth: '200px',
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
            }}
            />
        </div>
    )
}

export function SelectionComponent({Value: defaultValue = '', multiple, options, name, onChange, label, readonly}: SelectionComponentProps){
    if (!options) {
        options = [{value: '', label: ''}];
        console.error("No options found for", name)
        return <div>No options found for {name}</div>
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
        <div data-testid={name} className="flex flex-col justify-between ">
            {label && <label id={`${name}-label`} htmlFor={name} className="py-2">{label}:</label>}
            <Select inputId={name} 
            aria-labelledby={`${name}-label`} 
            value={selectDefaultValue} 
            onChange={onChange} 
            options={options} 
            name={name} 
            placeholder="Search" 
            isMulti={multiple} 
            isDisabled={readonly}
            classNamePrefix="react-select"
            styles = {{
                control: (baseStyles: any, state: any) => ({
                    ...baseStyles,
                    borderColor: state.isFocused ? 'orange' : 'gray',
                    boxShadow: state.isFocused ? '0 0 0 2px orange' : 'none',
                    minWidth: '200px',
                    '&:hover': {
                        borderColor: state.isFocused ? 'orange' : 'gray',
                    },
                }),
                option: (state: any) => ({
                    padding: '5px 10px',
                    rounded: '5px',
                    '&:hover': {
                        backgroundColor: '#cacacc',
                    },
                    backgroundColor: state.isFocused ? '#cacacc' : 'white',
                })

            }}/>
        </div>
    )
}