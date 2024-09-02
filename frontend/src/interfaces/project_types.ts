import { FormEvent } from "react"

export type ProjectStatus = 
    "ACTIVE" |
    "NOT STARTED" |
    "COMPLETED" |
    "CANCELLED"

export type quarter = 
    "Q1" |
    "Q2" |
    "Q3" |
    "Q4"

export type UpdateProjectProps = {
    project_id: string
    project_name: string
    manager: string
    city: string
    quarter: quarter
    client_name: string
    start_date: string
    end_date: string
    notes?: string
    status: ProjectStatus
}

export type FilterProps = {
    filterText: string
    onFilter: (e: FormEvent<HTMLInputElement>) => void
    onClear: () => void
}

export type ProjectManagerCustomerCityProps =  {
    city: string;
    current_manager: string;
    customer_name: string;
    projectManagerList: string[] | undefined;
};

export type ProjectStatusAndDateProps =  {
    end_date: string;
    project_status: ProjectStatus;
    start_date: string;
};

export type ProjectFormProps = {
    button_text: string
    projectManagerList?: string[]
    onSubmit: (event: FormEvent<HTMLFormElement>) => void

    // For Project Update
    formProps?: UpdateProjectProps
}

export type ProjectNameIDProps =  {
    project_id: string;
    project_name: string;
};

export type ProjectFormMiddleProps =  {
    city: string;
    current_manager: string;
    customer_name: string;
    end_date: string;
    project_status: ProjectStatus;
    projectManagerList?: string[];
    start_date: string;
};