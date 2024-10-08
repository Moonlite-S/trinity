export type SelectionComponentProps = {
    Value?: string,
    multiple?: boolean,
    options: { value: string, label: string }[] | undefined,
    name: string,
    label?: string, // Dumb hack due to the fact that some forms look different
    onChange?: (e: unknown) => void,
    readonly?: boolean
}

export type SelectionButtonProps = {
    value: string
    label: string
}