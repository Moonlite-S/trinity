/*
    These components are used to create a generic form that can be used to create and edit tasks, submittals, and other forms.
*/

type GenericFormProps = {
    children: React.ReactNode
    form_id: string
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function GenericForm({children, form_id, onSubmit} : GenericFormProps) {
    return (
        <form id={form_id} onSubmit={onSubmit} data-testid={form_id} className="bg-slate-200 p-4 mt-4 rounded-md border border-zinc-500 w-3/4 mx-auto">
            {children}
        </form>
    )
}

type GenericInputProps = {  
    label: string
    value?: string
    name: string
    type: string
    className?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    readOnly?: boolean
    focus?: boolean
}

export function GenericInput({label, value, type, className, onChange, name, readOnly, focus}: GenericInputProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={name}>{label}</label>
            <input aria-label={label} type={type} id={name} name={name} defaultValue={value} onChange={onChange} required className={`bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2 ${className}`} readOnly={readOnly} autoFocus={focus}/>
        </div>
    )
}

type GenericSelectProps = {
    label: string
    value?: string
    name: string
    options: string[]
    className?: string
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export function GenericSelect({label, value, options, className, onChange, name}: GenericSelectProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={value}>{label}</label>
            <select id={value} name={name} defaultValue={value} onChange={onChange} required className={`bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2 ${className}`}>
                {options.map((option) => (
                    <option key={option} value={option}>{option}</option>

                ))}
            </select>
        </div>
    )
}

type GenericTextAreaProps = {
    label: string
    value?: string
    name: string
    className?: string
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    readOnly?: boolean
}

export function GenericTextArea({label, value, name, className, onChange, readOnly}: GenericTextAreaProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={name}>{label}</label>
            <textarea id={name} name={name} defaultValue={value} onChange={onChange} required className={`bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2 ${className}`} readOnly={readOnly}/>
        </div>
    )
}

type GenericSliderProps = {
    label: string
    value: number
    name: string
    className?: string
    onChange: (value: number) => void
}

export function GenericSlider({label, value, name, className, onChange}: GenericSliderProps) {
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(Number(e.target.value))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Math.min(100, Math.max(0, Number(e.target.value)))
        onChange(newValue)
    }

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={name}>{label}</label>
            <div className="flex items-center gap-4">
                <input
                    type="range"
                    id={`${name}-slider`}
                    name={`${name}-slider`}
                    min="0"
                    max="100"
                    value={value}
                    onChange={handleSliderChange}
                    className={`w-full ${className}`}
                />
                <input
                    type="number"
                    id={`${name}-input`}
                    name={`${name}-input`}
                    min="0"
                    max="100"
                    value={value}
                    onChange={handleInputChange}
                    className={`w-16 text-center bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2 ${className}`}
                />
            </div>
        </div>
    )
}

type GenericCheckboxProps = {
    label: string
    value: boolean
    name: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function GenericCheckbox({label, value, name, onChange}: GenericCheckboxProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={name}>{label}</label>
            <input type="checkbox" id={name} name={name} checked={value} onChange={onChange} className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2"/>
        </div>
    )
}

