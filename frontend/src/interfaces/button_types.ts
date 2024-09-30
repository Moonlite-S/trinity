export type SelectionComponentProps = {
    defaultValue?: string,
    value?: string,
    multiple?: boolean,
    options: { value: string, label: string }[] | undefined,
    name: string    
    onChange?: (e: unknown) => void
}