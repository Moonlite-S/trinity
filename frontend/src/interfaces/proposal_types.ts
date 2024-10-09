import { ProjectProps } from "./project_types"

export type ProposalProps = {
    proposal_id: string
    project_id: string
    proposal_name: string
    proposal_description: string
    proposal_date: string
    proposal_status: string
}

export type ProposalCreationProps = {
    projects: ProjectProps[]
}
