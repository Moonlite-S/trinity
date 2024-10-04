type GenericFormProps = {
    children: React.ReactNode
    form_id: string
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function GenericForm({children, form_id, onSubmit} : GenericFormProps) {
    return (
        <form id={form_id} onSubmit={onSubmit} className="bg-slate-200 p-5 rounded-md border border-zinc-500 m-5 w-3/4 mx-auto">
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
}

export function GenericInput({label, value, type, className, onChange, name, readOnly}: GenericInputProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={name}>{label}</label>
            <input aria-label={label} type={type} id={name} name={name} defaultValue={value} onChange={onChange} required className={`bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2 ${className}`} readOnly={readOnly}/>
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