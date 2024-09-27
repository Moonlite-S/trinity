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
    received_date: string
    project_name: string
    sub_description: string
    type: "mechanical" | "electrical" | "plumbing" | "fire_protection" | "other"
    assigned_to: string
    status: "open" | "closed"
    notes: string
}
