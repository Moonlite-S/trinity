export type SelectionComponentProps = {
    Value?: string,
    multiple?: boolean,
    options: { value: string, label: string }[] | undefined,
    name: string    
    onChange?: (e: unknown) => void
}

export type SelectionButtonProps = {
    value: string
    label: string
}