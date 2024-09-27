export type SubmittalCreation = {
    submittal_id: string
    project: string
    received_date: string
    type: string
    status: string
    user: string
    sub_description: string
    notes: string
}

export type Submittal = {
    submittal_id: string
    project_id: string
    client_name: string
    received_date: string
    project_name: string
    sub_description: string
    type: string
    assigned_to: string
    status: string
    notes: string
}
